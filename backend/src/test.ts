//import client from "./redis/client";
//console.log("process env", process.env);
//console.log(client);

import { RTCMocker } from "../test/RTCMocker";
import pool from "./redis/pool";

/*
import pool from "./redis/pool";
const main = async () => {
	console.log(pool);
	console.log("starting");
	await pool.addToPool({
		offering: "offering",
		seeking: "seeking",
		socketId: "socketId",
		userId: "userID",
	});
	console.log("done");
};
main();
*/

const offering = "English";
const seeking = "Spanish";
const userId1 = "user 1";
const userId2 = "2 user";
const mocker1 = new RTCMocker(offering, seeking, userId1);
const mocker2 = new RTCMocker(seeking, offering, userId2);
mocker1.disconnect();
mocker2.disconnect();
const main = async () => {
	const delay = (time) => {
		return new Promise((resolve) =>
			setTimeout(() => {
				return resolve;
			}, time)
		);
	};
	mocker1.connect();
	mocker1.waitForRoom();
	mocker2.connect();
	mocker2.waitForRoom();
};
main();
//mocker1.waitForRoom();