import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { type JoinRoomRes, type JoinRoomReq, SocketUser } from "./types";
import { Server, Socket } from "socket.io";
import consts from "./consts";
import * as _ from "lodash";
import { SocketEmits } from "./sockets";

const app = express();
const port = 4000;
const http = require("http");
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: consts.FRONTEND_URL,
		credentials: true,
	},
});

app.use(
	cors({
		origin: "*",
	})
);
app.use(bodyParser.json());
const establishedRooms = {};
const usersInRoom: any = {};
let userPool: SocketUser[] = [];

io.on("connection", (socket) => {
	socket.on(SocketEmits.WAIT_FOR_ROOM, async (data: JoinRoomReq) => {
		const allSockets = io.sockets.sockets;
		const userId = data.userId;
		console.log("User joined", userId);
		if (usersInRoom.hasOwnProperty(userId)) {
			console.log("Joining Room");
			const room = usersInRoom[userId];
			const data: JoinRoomRes = {
				roomId: room,
			};
			socket.join(room);
			io.to(room).emit(SocketEmits.JOIN_ROOM, data);
		} else {
			if (userPool.length >= 2) {
				let randomRoomId =
					String(Math.round(Math.random() * 1000000)) +
					"_" +
					String(Math.round(Math.random() * 1000000));
				let randomUser = _.sample(userPool);
				establishedRooms[randomRoomId] = [userId, randomUser];
				usersInRoom[userId] = randomRoomId;
				usersInRoom[randomUser.userId] = randomRoomId;
				console.log(randomUser);
				let s = await io.in(randomUser.socketId).fetchSockets();
				if (s.length == 0) {
					return;
				}
				let waitingSocket = s[0];
				console.log(waitingSocket);
				socket.join(randomRoomId);
				waitingSocket.join(randomRoomId);
				const data: JoinRoomRes = {
					roomId: randomRoomId,
				};
				userPool = userPool.filter(
					(u) => u.userId != randomUser.userId
				);
				io.to(randomRoomId).emit(SocketEmits.JOIN_ROOM, data);
			} else {
				const user: SocketUser = {
					userId,
					socketId: socket.id,
				};
				userPool.push(user);
			}
			console.log(userPool);
		}
	});

	socket.on("disconnecting", () => {
		socket.rooms;
	});
});

app.get("/", (req, res) => {
	res.send({ data: "hello world" });
});

server.listen(port, () => {
	return console.log(`Express is listening at http://localhost:${port}`);
});
