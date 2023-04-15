import express, { Request, RequestHandler, Response } from "express";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
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
import session, { Session, SessionOptions, Store } from "express-session";
import type { IncomingHttpHeaders, IncomingMessage } from "http";
import { app as firebaseApp, analytics } from "@/firebase";
import expressApp from "./api/app";
/*
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
app.use(sessionMiddleware);
app.use(
	cors({
		origin: "*",
	})
);
*/
const app = expressApp.app;
const server = expressApp.server;
const sessionMiddleware = expressApp.sessionMiddleware;
let establishedRooms: Record<string, Room> = {};
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
		if (utils.userHasRoom(userId, reverseUserLookup)) {
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
			const candidates = utils.findLanguageCandidates(pool, data);
			if (candidates) {
				let randomRoomId =
					String(Math.round(Math.random() * 1000000)) +
					"_" +
					String(Math.round(Math.random() * 1000000));
				const randomUser = utils.getRandomCandidate(candidates);
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
				establishedRooms = utils.addToRoom(
					establishedRooms,
					randomRoomId,
					room
				);
				reverseUserLookup = utils.addToLookUp(
					reverseUserLookup,
					userId,
					{
						offering: data.offering,
						seeking: data.seeking,
						roomId: randomRoomId,
					}
				);
				reverseUserLookup[randomUser.userId].roomId = randomRoomId;
				console.log("Other in-pool user", randomUser);
				let s = await io.in(randomUser.socketId).fetchSockets();
				if (s.length == 0) {
					return;
				}
				let waitingSocket = s[0];
				pool = utils.removeFromPool(
					pool,
					reverseUserLookup,
					randomUser.userId
				);
				socket.join(randomRoomId);
				waitingSocket.join(randomRoomId);
				const sioData: JoinedRoomReq = {
					roomId: randomRoomId,
					host: room.host,
					guest: room.guest,
				};
				io.to(randomRoomId).emit(SocketEmits.JOIN_ROOM, sioData);
			} else {
				console.log("Room is unavailable, putting in pool");
				const user: SocketUser = {
					userId,
					socketId: socket.id,
				};

				pool = utils.addToPool(pool, data.offering, data.seeking, user);
				console.log(pool.offering);
				console.log(
					pool.seeking,
					"seeking pool after user is added to pool"
				);
				reverseUserLookup = utils.addToLookUp(
					reverseUserLookup,
					userId,
					{
						offering: data.offering,
						seeking: data.seeking,
						roomId: null,
					}
				);
			}
		}
	});

	socket.on(SocketEmits.EMIT_ANSWER, (data: SendAnswerReq) => {
		console.log("got answer");
		const userId = req.session.userId;
		if (!reverseUserLookup.hasOwnProperty(userId)) {
			console.log(reverseUserLookup);
			console.log(userId);
			return;
		}

		const room = utils.getRoomForUser(
			userId,
			reverseUserLookup,
			establishedRooms
		);
		socket.broadcast.to(room.id).emit(SocketEmits.EMIT_ANSWER, data);
	});
	socket.on(SocketEmits.EMIT_CANDIDATE, (data: CandidateFoundReq) => {
		console.log("got candidate");
		const userId = req.session.userId;
		if (!reverseUserLookup.hasOwnProperty(userId)) {
			console.log(reverseUserLookup);
			console.log(userId);
			return;
		}
		const room = utils.getRoomForUser(
			userId,
			reverseUserLookup,
			establishedRooms
		);
		socket.broadcast.to(room.id).emit(SocketEmits.EMIT_CANDIDATE, data);
	});
	socket.on(SocketEmits.EMIT_OFFER, (data: SendOfferReq) => {
		const userId = req.session.userId;
		if (!reverseUserLookup.hasOwnProperty(userId)) {
			console.log(reverseUserLookup);
			console.log(userId);
			return;
		}
		console.log("Recevied offer from", socket.id);
		const room = utils.getRoomForUser(
			userId,
			reverseUserLookup,
			establishedRooms
		);
		socket.broadcast.to(room.id).emit(SocketEmits.EMIT_OFFER, data);
	});
	socket.on(SocketEmits.GET_ALL_MESSAGES, (emptyArg, callback) => {
		const userId = req.session.userId;
		if (!utils.userHasRoom(userId, reverseUserLookup)) {
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
		console.log(userId, "user id from session");
		if (!utils.userHasRoom(userId, reverseUserLookup)) {
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
		if (!utils.userHasRoom(userId, reverseUserLookup)) {
			const languages = utils.getLanguagesForUser(
				userId,
				reverseUserLookup
			);
			// this guy never existed in our reverseUserLookup
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
			pool = utils.removeFromPool(pool, reverseUserLookup, userId);
			reverseUserLookup = utils.removeFromLookup(
				reverseUserLookup,
				userId
			);
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
			establishedRooms = utils.removeFromRoom(
				establishedRooms,
				updatedRoom.guest
			);
			establishedRooms = utils.removeFromRoom(
				establishedRooms,
				updatedRoom.host
			);
			reverseUserLookup = utils.removeFromLookup(
				reverseUserLookup,
				updatedRoom.guest
			);
			reverseUserLookup = utils.removeFromLookup(
				reverseUserLookup,
				updatedRoom.host
			);
			console.log("updated reverseUserLookup", reverseUserLookup);
			console.log("updated establishedRooms", establishedRooms);
			return;
		}
		establishedRooms[room.id] = updatedRoom;
		socket.broadcast.to(room.id).emit(SocketEmits.PARTNER_DISCONNECTED);
	});
});

// put this in a separate file for now
app.get("/", (req, res) => {
	res.setHeader;
	res.send({ data: "hello world" });
});

app.post("/sessionLogin", (req, res) => {
	// Get the ID token passed and the CSRF token.
	const idToken = req.body.idToken.toString();
	const csrfToken = req.body.csrfToken.toString();
	// Guard against CSRF attacks.
	if (csrfToken !== req.cookies.csrfToken) {
		res.status(401).send("UNAUTHORIZED REQUEST!");
		return;
	}
	// Set session expiration to 5 days.
	const expiresIn = 60 * 60 * 24 * 5 * 1000;
	// Create the session cookie. This will also verify the ID token in the process.
	// The session cookie will have the same claims as the ID token.
	// To only allow session cookie setting on recent sign-in, auth_time in ID token
	// can be checked to ensure user was recently signed in before creating a session cookie.
	getAuth()
		.createSessionCookie(idToken, { expiresIn })
		.then(
			(sessionCookie) => {
				// Set cookie policy for session cookie.
				const options = {
					maxAge: expiresIn,
					httpOnly: true,
					secure: true,
				};
				res.cookie("session", sessionCookie, options);
				res.end(JSON.stringify({ status: "success" }));
			},
			(error) => {
				res.status(401).send("UNAUTHORIZED REQUEST!");
			}
		);
});

/*
server.listen(port, () => {
	return console.log(`Express is listening at http://localhost:${port}`);
});
*/
