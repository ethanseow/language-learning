import express, { Request, RequestHandler, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import type {
	JoinRoomReq,
	JoinedRoomReq,
	PartnerJoinedReq,
	CandidateFoundReq,
	SendOfferReq,
	SendAnswerReq,
	SocketUser,
} from "./sockets";
import { Server, Socket } from "socket.io";
import consts from "./consts";
import * as _ from "lodash";
import { SocketEmits } from "./sockets";
import session, { Session, SessionOptions, Store } from "express-session";
import type { IncomingHttpHeaders, IncomingMessage } from "http";
const app = express();
const port = 4000;
const http = require("http");
const server = http.createServer(app);
const sessionMiddleware = session({
	secret: "changeit",
	resave: false,
	saveUninitialized: false,
});

app.use(sessionMiddleware);
app.use(
	cors({
		origin: "*",
	})
);
app.use(bodyParser.json());
const establishedRooms = {};
const usersInRoom = {};
let userPool: SocketUser[] = [];

// convert a connect middleware to a Socket.IO middleware
const wrap = (middleware) => (socket, next) =>
	middleware(socket.request, {}, next);

declare module "express-session" {
	interface Session {
		userId: string;
	}
}

declare module "http" {
	interface IncomingMessage {
		sessionStore: Store;
		session: session.Session;
		cookieHolder: string;
	}
}

const io = new Server(server, {
	cors: {
		origin: consts.FRONTEND_URL,
		credentials: true,
	},
	allowRequest: (req, callback) => {
		// with HTTP long-polling, we have access to the HTTP response here, but this is not
		// the case with WebSocket, so we provide a dummy response object
		const fakeRes: Response = {
			getHeader() {
				return [];
			},
			// @ts-ignore
			setHeader(name, value) {
				req.cookieHolder = value[0];
			},
			// @ts-ignore
			writeHead() {},
		};
		// @ts-ignore
		sessionMiddleware(req, fakeRes, () => {
			if (req.session) {
				// trigger the setHeader() above

				// @ts-ignore
				fakeRes.writeHead();
				// manually save the session (normally triggered by res.end())
				req.session.save();
			}
			callback(null, true);
		});
	},
});

io.engine.on("initial_headers", (headers, req) => {
	if (req.cookieHolder) {
		headers["set-cookie"] = req.cookieHolder;
		delete req.cookieHolder;
	}
});

io.on("connection", (socket) => {
	const req = socket.request;
	socket.use((__, next) => {
		req.session.reload((err) => {
			if (err) {
				socket.disconnect();
			} else {
				next();
			}
		});
	});
	socket.on(SocketEmits.WAIT_FOR_ROOM, async (data: JoinRoomReq) => {
		const userId = data.userId;
		if (!req.session.userId) {
			req.session.userId = userId;
			req.session.save();
		}
		console.log("User joined", userId);
		if (usersInRoom.hasOwnProperty(userId)) {
			console.log("Joining Existing Room");
			const room = usersInRoom[userId];
			const data: JoinedRoomReq = {
				roomId: room,
				isInitiator: false,
			};
			socket.join(room);
			io.to(room).emit(SocketEmits.JOIN_ROOM, data);
		} else {
			if (userPool.length >= 1) {
				console.log("Room is available, sending them to room");
				let randomRoomId =
					String(Math.round(Math.random() * 1000000)) +
					"_" +
					String(Math.round(Math.random() * 1000000));
				let randomUser = _.sample(userPool);
				if (randomUser.socketId == socket.id) {
					return;
				}
				establishedRooms[randomRoomId] = [userId, randomUser];
				usersInRoom[userId] = randomRoomId;
				usersInRoom[randomUser.userId] = randomRoomId;

				console.log("Other in-pool user", randomUser);
				let s = await io.in(randomUser.socketId).fetchSockets();
				if (s.length == 0) {
					return;
				}
				let waitingSocket = s[0];
				userPool = userPool.filter(
					(u) => u.userId != randomUser.userId
				);

				socket.join(randomRoomId);
				waitingSocket.join(randomRoomId);
				waitingSocket.emit(SocketEmits.PARTNER_JOINED);

				const waitingSocketData: JoinedRoomReq = {
					roomId: randomRoomId,
					isInitiator: true,
				};
				const newerSocketData: JoinedRoomReq = {
					roomId: randomRoomId,
					isInitiator: false,
				};
				socket.emit(SocketEmits.JOIN_ROOM, newerSocketData);
				waitingSocket.emit(SocketEmits.JOIN_ROOM, waitingSocketData);
			} else {
				console.log("Room is unavailable, putting in pool");
				const user: SocketUser = {
					userId,
					socketId: socket.id,
				};
				userPool.push(user);
			}
			console.log(userPool);
		}
	});

	socket.on(SocketEmits.EMIT_ANSWER, (data: SendAnswerReq) => {
		const userId = req.session.userId;
		if (!usersInRoom.hasOwnProperty(userId)) {
			return;
		}
		const room = usersInRoom[userId];
		console.log("Received answer from", socket.id);
		socket.broadcast.to(room).emit(SocketEmits.EMIT_ANSWER, data);
	});
	socket.on(SocketEmits.EMIT_CANDIDATE, (data: CandidateFoundReq) => {
		const userId = req.session.userId;
		if (!usersInRoom.hasOwnProperty(userId)) {
			return;
		}
		const room = usersInRoom[userId];
		socket.broadcast.to(room).emit(SocketEmits.EMIT_CANDIDATE, data);
	});
	socket.on(SocketEmits.EMIT_OFFER, (data: SendOfferReq) => {
		const userId = req.session.userId;
		if (!usersInRoom.hasOwnProperty(userId)) {
			return;
		}
		const room = usersInRoom[userId];
		console.log("Recevied offer from", socket.id);
		socket.broadcast.to(room).emit(SocketEmits.EMIT_OFFER, data);
	});
	// have to decide how to deal with on leave and who is initiator
	socket.on("disconnecting", () => {});
});

app.get("/", (req, res) => {
	res.setHeader;
	res.send({ data: "hello world" });
});

server.listen(port, () => {
	return console.log(`Express is listening at http://localhost:${port}`);
});
