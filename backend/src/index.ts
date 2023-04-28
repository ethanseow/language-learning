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
import { type Room, type Pool, type UserLookup, UserPool, User } from "./types";
import utils from "./utils/room";
import { Server, Socket } from "socket.io";
import consts from "./consts";
import * as _ from "lodash";
import { SocketEmits } from "./sockets";
import session, { Session, SessionOptions, Store } from "express-session";
import type { IncomingHttpHeaders, IncomingMessage } from "http";
import { app as firebaseApp, analytics } from "@/firebase";
import { pool } from "./utils/Pool";
import { rooms } from "./utils/Rooms";
import { sockets } from "./utils/Sockets";
import expressApp from "./api/app";
const app = expressApp.app;
const server = expressApp.server;
const sessionMiddleware = expressApp.sessionMiddleware;

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

export const io = new Server(server, {
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
		const user: User = {
			offering: data.offering,
			seeking: data.seeking,
			userId: data.userId,
			socketId: socket.id,
		};
		const $pool = pool.findUserInPool(userId);
		const $room = rooms.findRoomForUser(userId);
		if ($pool) {
		} else if ($room) {
			if (!$room.users[userId].isActive) {
				rooms.rejoinRoom(user);
				const otherSocket = rooms.findOtherUserInRoom(userId);
				io.to(otherSocket.socketId).emit(
					SocketEmits.ASK_POLITENESS,
					{},
					(isPolite: boolean) => {
						const data: JoinedRoomReq = {
							roomId: $room.id,
							isPolite: !isPolite,
						};
						io.to(socket.id).emit(SocketEmits.CREATED_ROOM, data);
					}
				);
			}
		} else if (!$pool) {
			pool.addToPool(user);
		} else if (!$room) {
			const otherUser = pool.getCompatibleUser(user);
			if (otherUser) {
				pool.removeFromPool(otherUser.userId);
				const room = rooms.createRoom(otherUser, user);
				const otherSocket = io.sockets.sockets.get(otherUser.socketId);
				const mySocket = socket;
				otherSocket.join(room.id);
				mySocket.join(room.id);
				io.to(otherSocket.id).emit(SocketEmits.CREATED_ROOM, {
					roomId: room.id,
					isPolite: false,
				});
				io.to(socket.id).emit(SocketEmits.CREATED_ROOM, {
					roomId: room.id,
					isPolite: true,
				});
			}
		}
		console.log(pool);
	});

	socket.on(SocketEmits.EMIT_ANSWER, (data: SendAnswerReq) => {
		const userId = req.session.userId;
		const $room = rooms.findRoomForUser(userId);
		socket.broadcast.to($room.id).emit(SocketEmits.EMIT_ANSWER, data);
	});
	socket.on(SocketEmits.EMIT_CANDIDATE, (data: CandidateFoundReq) => {
		console.log("got candidate");
		const userId = req.session.userId;
		const $room = rooms.findRoomForUser(userId);
		socket.broadcast.to($room.id).emit(SocketEmits.EMIT_CANDIDATE, data);
	});
	socket.on(SocketEmits.EMIT_OFFER, (data: SendOfferReq) => {
		const userId = req.session.userId;
		const $room = rooms.findRoomForUser(userId);
		socket.broadcast.to($room.id).emit(SocketEmits.EMIT_OFFER, data);
	});
	/*
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
    */
	socket.on("disconnecting", () => {
		console.log("disconnecting");
		const userId = req.session.userId;
		const $pool = pool.findUserInPool(userId);
		const $room = rooms.findRoomForUser(userId);

		if ($pool) {
			pool.removeFromPool(userId);
			// emit other user
		} else if ($room) {
			rooms.leaveRoom(userId);
			// emit other user
		} else if (!$pool) {
		} else if (!$room) {
		}
	});
});

app.get("/get_lookups", (req, res) => {
	res.send({
		pool,
		rooms,
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
