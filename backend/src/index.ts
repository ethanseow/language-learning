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
	SendDesc,
} from "./sockets";
import { type Room, type Pool, type UserLookup, UserPool, User } from "./types";
import { Server, Socket } from "socket.io";
import consts from "./consts";
import * as _ from "lodash";
import { SocketEmits } from "./sockets";
import session, { Session, SessionOptions, Store } from "express-session";
import type { IncomingHttpHeaders, IncomingMessage } from "http";
import { app as firebaseApp, analytics } from "@/firebase";
import pool from "./redis/pool";
import rooms from "./redis/room";
import expressApp from "./api/app";
const app = expressApp.app;
const server = expressApp.server;
const sessionMiddleware = expressApp.sessionMiddleware;

type SessionUser = {
	userId: string;
};

declare module "http" {
	interface IncomingMessage {
		session: Session & {
			user: SessionUser;
		};
		cookieHolder?: string;
	}
}

export const io = new Server(server, {
	cors: {
		origin: consts.FRONTEND_URL,
		credentials: true,
	},
});

io.engine.use(sessionMiddleware);

const cookieLookup = {
	cookie1: "user1",
	cookie2: "2user",
};

io.on("connection", (socket) => {
	console.log("Socket has connected", socket.id);
	const req = socket.request;
	socket.use((__, next) => {
		const authCookie = socket.handshake.auth.authCookie;
		console.log("in socket.use middleware - retrieved cookie", authCookie);
		if (authCookie && !req.session.user) {
			req.session.user = { userId: cookieLookup[authCookie] };
			req.session.save();
			console.log(
				"In socket.use middleware - setting session",
				req.session,
				"for cookie",
				authCookie
			);
		}
		next();
	});
	socket.use((__, next) => {
		//@ts-ignore
		req.session.reload((err) => {
			if (err) {
				socket.disconnect();
			} else {
				next();
			}
		});
	});

	socket.on(
		SocketEmits.WAIT_FOR_ROOM,
		async (data: JoinRoomReq, callback) => {
			const userId = data.userId;
			const user: User = {
				offering: data.offering,
				seeking: data.seeking,
				userId: data.userId,
				socketId: socket.id,
			};
			console.log(
				"SocketEmits.WAIT_FOR_ROOM - user has waited for room",
				user
			);
			const $pool = await pool.findUserInPool(userId);
			const $room = await rooms.findRoomForUser(userId);
			if ($pool) {
			} else if ($room) {
				const $roomUsers = await rooms.findUsersForRoom($room);
				if (!$roomUsers[userId]?.isActive) {
					console.log(
						"SocketEmits.WAIT_FOR_ROOM - user is already part of a room and has left before"
					);
					await rooms.rejoinRoom(userId);
					const otherSocket = await rooms.findOtherUserInRoom(userId);
					/*
					console.log(
						"SocketEmits.WAIT_FOR_ROOM - otherSocket",
						otherSocket
					);
                    */
					socket.join($room.id);
					io.to(otherSocket.socketId).emit(SocketEmits.REJOIN_ROOM, {
						roomId: $room.id,
						isPolite: false,
					});
					io.to(socket.id).emit(SocketEmits.CREATED_ROOM, {
						roomId: $room.id,
						isPolite: true,
					});
				}
			} else if (!$pool && !$room) {
				const otherUser = await pool.getCompatibleUser(user);
				if (otherUser) {
					console.log(
						"SocketEmits.WAIT_FOR_ROOM - me",
						req.session.user.userId,
						"- compatiable user",
						otherUser.userId
					);
					const otherUserUserObj: User = {
						offering: otherUser.offering,
						seeking: otherUser.seeking,
						userId: otherUser.userId,
						socketId: otherUser.socketId,
					};
					await pool.removeFromPool(otherUser.userId);
					const room = await rooms.createRoom(otherUserUserObj, user);
					const otherSocket = io.sockets.sockets.get(
						otherUser.socketId
					);
					const mySocket = socket;
					otherSocket.join(room.id);
					mySocket.join(room.id);
					console.log(
						"SocketEmits.WAIT_FOR_ROOM - users are joining room",
						room.entityId
					);
					io.to(otherSocket.id).emit(SocketEmits.CREATED_ROOM, {
						roomId: room.id,
						isPolite: false,
					});
					io.to(socket.id).emit(SocketEmits.CREATED_ROOM, {
						roomId: room.id,
						isPolite: true,
					});
				} else {
					console.log(
						"SocketEmits.WAIT_FOR_ROOM - user is joining pool"
					);
					await pool.addToPool(user);
				}
			}
		}
	);

	socket.on(SocketEmits.EMIT_DESC, async (data: SendDesc) => {
		//@ts-ignore
		const authCookie = socket.handshake.auth.authCookie;
		const userId = req.session?.user?.userId;
		if (!userId) {
			console.log(
				"SocketEmits.EMIT_DESC- no userId - session",
				req.session,
				"authCookie",
				authCookie
			);
		}
		const $room = await rooms.findRoomForUser(userId);
		socket.broadcast.to($room.id).emit(SocketEmits.EMIT_DESC, data);
	});
	socket.on(SocketEmits.EMIT_ANSWER, async (data: SendAnswerReq) => {
		//@ts-ignore
		const authCookie = socket.handshake.auth.authCookie;
		const userId = req.session?.user?.userId;
		if (!userId) {
			console.log(
				"SocketEmits.EMIT_ANSWER - no userId - session",
				req.session,
				"authCookie",
				authCookie
			);
		}
		console.log("SocketEmits.EMIT_ANSWER - emitting answer", userId);
		const $room = await rooms.findRoomForUser(userId);
		socket.broadcast.to($room.id).emit(SocketEmits.EMIT_ANSWER, data);
	});
	socket.on(SocketEmits.EMIT_CANDIDATE, async (data: CandidateFoundReq) => {
		const authCookie = socket.handshake.auth.authCookie;
		const userId = req.session?.user?.userId;
		if (!userId) {
			console.log(
				"SocketEmits.EMIT_CANDIDATE- no userId - session",
				req.session,
				"authCookie",
				authCookie
			);
		}
		const $room = await rooms.findRoomForUser(userId);
		socket.broadcast.to($room.id).emit(SocketEmits.EMIT_CANDIDATE, data);
	});
	socket.on(SocketEmits.EMIT_OFFER, async (data: SendOfferReq) => {
		const authCookie = socket.handshake.auth.authCookie;
		//@ts-ignore
		const userId = req.session?.user?.userId;
		if (!userId) {
			console.log(
				"SocketEmits.EMIT_OFFER- no userId - session",
				req.session,
				"authCookie",
				authCookie
			);
		}
		const $room = await rooms.findRoomForUser(userId);
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
	socket.on("disconnecting", async () => {
		const authCookie = socket.handshake.auth.authCookie;
		console.log("Socket.disconnecting");
		const userId = req.session?.user?.userId;
		if (!userId) {
			console.log(
				"Socket.disconnecting - no userId - session",
				req.session,
				"authCookie",
				authCookie
			);
			return;
		}
		try {
			const $pool = await pool.findUserInPool(userId);
			const $room = await rooms.findRoomForUser(userId);
			if ($pool) {
				await pool.removeFromPool(userId);
				// emit other user
			} else if ($room) {
				await rooms.leaveRoom(userId);
				// emit other user
			} else if (!$pool) {
			} else if (!$room) {
			}
		} catch (e) {
			console.log(e);
		}
	});
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
