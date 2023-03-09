import express, { Request, RequestHandler, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import {
	JoinRoomReq,
	JoinedRoomReq,
	PartnerJoinedReq,
	CandidateFoundReq,
	SendOfferReq,
	SendAnswerReq,
	SocketUser,
	SocketNamespaces,
} from "./sockets";
import { type Room } from "./types";
import utils from "./utils/room";
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

let establishedRooms: Record<string, Room> = {};
let usersInRoom: Record<string, string> = {};
let userPool: Record<string, SocketUser> = {};

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

const webRtcNamespace = io.of(SocketNamespaces.WEB_RTC);
const textChatNamespace = io.of(SocketNamespaces.TEXT_CHAT);

webRtcNamespace.on("connection", (socket) => {
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
		if (utils.userHasRoom(userId, usersInRoom)) {
			console.log("Joining Existing Room");
			const room = utils.getRoomForUser(
				userId,
				usersInRoom,
				establishedRooms
			);
			const data: JoinedRoomReq = {
				roomId: room.id,
				host: room.host,
				guest: room.guest,
			};
			socket.join(room.id);
			webRtcNamespace.to(room.id).emit(SocketEmits.JOIN_ROOM, data);
		} else {
			if (Object.keys(userPool).length >= 1) {
				console.log("Room is available, sending them to room");
				let randomRoomId =
					String(Math.round(Math.random() * 1000000)) +
					"_" +
					String(Math.round(Math.random() * 1000000));
				let randomIndex = _.sample(Object.keys(userPool));
				let randomUser = userPool[randomIndex];
				if (randomUser.socketId == socket.id) {
					return;
				}
				const room: Room = {
					id: randomRoomId,
					host: randomUser.userId,
					guest: userId,
					numInRoom: 2,
					messages: [],
				};
				establishedRooms[randomRoomId] = room;
				usersInRoom[userId] = randomRoomId;
				usersInRoom[randomUser.userId] = randomRoomId;
				console.log("Other in-pool user", randomUser);
				let s = await webRtcNamespace
					.in(randomUser.socketId)
					.fetchSockets();
				if (s.length == 0) {
					return;
				}
				let waitingSocket = s[0];
				delete userPool[randomUser.userId];
				socket.join(randomRoomId);
				waitingSocket.join(randomRoomId);
				const data: JoinedRoomReq = {
					roomId: randomRoomId,
					host: room.host,
					guest: room.guest,
				};
				webRtcNamespace
					.to(randomRoomId)
					.emit(SocketEmits.JOIN_ROOM, data);
			} else {
				console.log("Room is unavailable, putting in pool");
				const user: SocketUser = {
					userId,
					socketId: socket.id,
				};
				userPool[userId] = user;
			}
			console.log(userPool);
		}
	});

	socket.on(SocketEmits.EMIT_ANSWER, (data: SendAnswerReq) => {
		console.log("got answer");
		const userId = req.session.userId;
		if (!usersInRoom.hasOwnProperty(userId)) {
			console.log(usersInRoom);
			console.log(userId);
			return;
		}
		const room = usersInRoom[userId];
		socket.broadcast.to(room).emit(SocketEmits.EMIT_ANSWER, data);
	});
	socket.on(SocketEmits.EMIT_CANDIDATE, (data: CandidateFoundReq) => {
		console.log("got candidate");
		const userId = req.session.userId;
		if (!usersInRoom.hasOwnProperty(userId)) {
			console.log(usersInRoom);
			console.log(userId);
			return;
		}
		const room = usersInRoom[userId];
		socket.broadcast.to(room).emit(SocketEmits.EMIT_CANDIDATE, data);
	});
	socket.on(SocketEmits.EMIT_OFFER, (data: SendOfferReq) => {
		const userId = req.session.userId;
		if (!usersInRoom.hasOwnProperty(userId)) {
			console.log(usersInRoom);
			console.log(userId);
			return;
		}
		const room = usersInRoom[userId];
		console.log("Recevied offer from", socket.id);
		socket.broadcast.to(room).emit(SocketEmits.EMIT_OFFER, data);
	});
	socket.on("disconnecting", () => {
		console.log("disconnecting");
		const userId = req.session.userId;
		if (!utils.userHasRoom(userId, usersInRoom)) {
			console.log("user not in any room, removing from pool", userPool);
			delete userPool[userId];
			console.log("updated userPool", userPool);
			return;
		}
		const room = utils.getRoomForUser(
			userId,
			usersInRoom,
			establishedRooms
		);
		let updatedRoom = utils.decrementRoomUsers(room);
		if (utils.isHost(userId, room)) {
			console.log("user is host", userId, "in room", room);
			updatedRoom = utils.rotateHost(updatedRoom);
			console.log("updated room", updatedRoom);
		}
		if (updatedRoom.numInRoom <= 0) {
			console.log("no users left in the room", updatedRoom);
			delete usersInRoom[updatedRoom.host];
			delete usersInRoom[updatedRoom.guest];
			delete establishedRooms[room.id];
			console.log("updated usersInRoom", usersInRoom);
			console.log("updated establishedRooms", establishedRooms);
			return;
		}
		establishedRooms[room.id] = updatedRoom;
		socket.broadcast.to(room.id).emit(SocketEmits.PARTNER_DISCONNECTED);
	});
});

textChatNamespace.on("connection", (socket) => {
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

	socket.on("message", () => {});
});

app.get("/", (req, res) => {
	res.setHeader;
	res.send({ data: "hello world" });
});

server.listen(port, () => {
	return console.log(`Express is listening at http://localhost:${port}`);
});
