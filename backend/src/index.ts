import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { type JoinRoomRes, type JoinRoomReq } from "./types";
import * as _ from "lodash";
const app = express();
const port = 4000;
app.use(
	cors({
		origin: "*",
	})
);
app.use(bodyParser.json());

const establishedRooms = {};
const usersInRoom: any = {};
const userPool = [];

app.post("/join-room", (req, res) => {
	const data: JoinRoomReq = req.body;
	const user = data.userId;
	let reply: JoinRoomRes = {
		roomId: -1,
		receivedParter: false,
	};
	if (!usersInRoom.hasOwnProperty(user)) {
		reply.roomId = usersInRoom[user];
		reply.receivedParter = true;
		res.send(reply);
	} else {
		if (userPool.length > 0) {
			_.sample();
		} else {
			reply.roomId = -1;
			reply.receivedParter = false;
			res.send(reply);
		}
	}
});

app.listen(port, () => {
	return console.log(`Express is listening at http://localhost:${port}`);
});
