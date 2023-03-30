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
	type Message,
} from "./sockets";
import { type Room, type Pool, type UserLookup, UserPool } from "./types";
import utils from "./utils/room";
import { Server, Socket } from "socket.io";
import consts from "./consts";
import * as _ from "lodash";
import { SocketEmits } from "./sockets";
import session, { Store } from "express-session";
const app = express();
const port = 4000;
const http = require("http");
const server = http.createServer(app);

const sessionMiddleware = session({
	secret: "changed",
	resave: false,
	saveUninitialized: true,
});

app.use(bodyParser.json());
//app.use(sessionMiddleware);
app.use(
	cors({
		origin: "*",
	})
);

let establishedRooms: Record<string, Room> = {};
let usersInRoom: Record<string, string> = {};

let reverseUserLookup: Record<string, UserLookup> = {};

let pool: Pool = {
	offering: {},
	seeking: {},
};

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
		if (utils.userHasRoom(userId, usersInRoom)) {
			console.log("Joining Existing Room");
			const room = utils.getRoomForUser(
				userId,
				reverseUserLookup,
				establishedRooms
			);
			const data: JoinedRoomReq = {
				roomId: room.id,
				host: room.host,
				guest: room.guest,
			};
			socket.join(room.id);
			establishedRooms[room.id] = utils.incrementRoomUsers(room);
			io.to(room.id).emit(SocketEmits.JOIN_ROOM, data);
		} else {
			const userPool = pool.offering[data.seeking];
			const offeringPool = pool.offering[data.seeking];
			const seekingPool = pool.seeking[data.offering];
			const candidates: (keyof UserPool)[] = [];
			Object.keys(offeringPool).forEach((user: keyof UserPool) => {
				if (seekingPool.hasOwnProperty(user)) {
					candidates.push(user);
				}
			});
			if (candidates) {
				let randomRoomId =
					String(Math.round(Math.random() * 1000000)) +
					"_" +
					String(Math.round(Math.random() * 1000000));
				let randomIndex = _.sample(Object.keys(candidates));
				let randomUser = offeringPool[candidates[randomIndex]];
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
				let s = await io.in(randomUser.socketId).fetchSockets();
				if (s.length == 0) {
					return;
				}
				let waitingSocket = s[0];
				delete offeringPool[randomUser.userId];
				delete seekingPool[randomUser.userId];
				socket.join(randomRoomId);
				waitingSocket.join(randomRoomId);
				const data: JoinedRoomReq = {
					roomId: randomRoomId,
					host: room.host,
					guest: room.guest,
				};
				io.to(randomRoomId).emit(SocketEmits.JOIN_ROOM, data);
			} else {
				console.log("Room is unavailable, putting in pool");
				const user: SocketUser = {
					userId,
					socketId: socket.id,
				};
				pool.offering[data.offering][data.userId] = user;
				pool.offering[data.seeking][data.userId] = user;
				reverseUserLookup[userId].offering = data.offering;
				reverseUserLookup[userId].seeking = data.seeking;
			}
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
	socket.on(SocketEmits.GET_ALL_MESSAGES, (emptyArg, callback) => {
		const userId = req.session.userId;
		if (!utils.userHasRoom(userId, usersInRoom)) {
			console.log(
				"Sending Message - user",
				userId,
				"does not have a room"
			);
			return;
		}
		const room = utils.getRoomForUser(
			userId,
			reverseUserLookup,
			establishedRooms
		);
		callback({ messages: room.messages });
	});
	socket.on(SocketEmits.SEND_MESSAGE, (message: Message) => {
		const userId = req.session.userId;
		if (!utils.userHasRoom(userId, usersInRoom)) {
			console.log(
				"Sending Message - user",
				userId,
				"does not have a room"
			);
			return;
		}
		const room = utils.getRoomForUser(
			userId,
			reverseUserLookup,
			establishedRooms
		);
		room.messages.push(message);
		socket.broadcast.to(room.id).emit(SocketEmits.SEND_MESSAGE, message);
	});
	socket.on("disconnecting", () => {
		console.log("disconnecting");
		const userId = req.session.userId;
		if (!utils.userHasRoom(userId, usersInRoom)) {
			const languages = utils.getLanguagesForUser(
				userId,
				reverseUserLookup
			);
			if (!languages) {
				return;
			}
			const seeking = languages.seeking;
			const offering = languages.offering;
			const offeringPool = pool.offering[offering];
			const seekingPool = pool.seeking[seeking];
			console.log(
				"user not in any room, removing from offering pool",
				offeringPool
			);
			console.log(
				"user not in any room, removing from seeking pool",
				seekingPool
			);
			delete offeringPool[userId];
			delete seekingPool[userId];
			console.log("updated offering pool", offeringPool);
			console.log("updated seeking pool", seekingPool);
			return;
		}
		const room = utils.getRoomForUser(
			userId,
			reverseUserLookup,
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
			delete reverseUserLookup[userId];
			console.log("updated usersInRoom", usersInRoom);
			console.log("updated establishedRooms", establishedRooms);
			return;
		}
		establishedRooms[room.id] = updatedRoom;
		socket.broadcast.to(room.id).emit(SocketEmits.PARTNER_DISCONNECTED);
	});
});

app.get("/", (req, res) => {
	res.setHeader;
	res.send({ data: "hello world" });
});

server.listen(port, () => {
	return console.log(`Express is listening at http://localhost:${port}`);
});
