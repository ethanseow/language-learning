import { RTCMocker } from "../test/RTCMocker";
import pool from "./../src/redis/pool";
import room from "./../src/redis/room";
const offering = "English";
const seeking = "Spanish";
const userId1 = "user1";
const userId2 = "2user";
const authCookie1 = "cookie1";
const authCookie2 = "cookie2";
const mocker1 = new RTCMocker(offering, seeking, userId1, authCookie1);
const mocker2 = new RTCMocker(seeking, offering, userId2, authCookie2);

const delay = (time) => {
	return new Promise((resolve) => setTimeout(resolve, time));
};
const done = () => {
	console.log("Finished with test");
};
const main = async () => {
	await pool.clearAll();
	await room.clearAll();
	mocker1.connect();
	mocker1.waitForRoom();
	await delay(1000);
	mocker2.connect();
	mocker2.waitForRoom();
	await delay(1000);

	const fullyCompleted = {
		mocker1: {
			signaling: false,
			connection: false,
		},
		mocker2: {
			signaling: false,
			connection: false,
		},
	};

	const checkIfFullyCompleted = () => {
		Object.keys(fullyCompleted).forEach((mocker) => {
			Object.keys(mocker).forEach((key) => {
				if (fullyCompleted[mocker][key] == false) {
					return false;
				}
			});
		});
		done();
		return true;
	};
	mocker1.peerConnection.onsignalingstatechange = (e) => {
		console.log(
			"mocker1 signaling state has changed",
			mocker1.peerConnection.signalingState
		);
		if (mocker1.peerConnection.signalingState == "stable") {
			fullyCompleted.mocker1.signaling = true;
		}
		checkIfFullyCompleted();
	};
	mocker2.peerConnection.onsignalingstatechange = (e) => {
		console.log(
			"mocker2 signaling state has changed",
			mocker2.peerConnection.signalingState
		);
		if (mocker2.peerConnection.signalingState == "stable") {
			fullyCompleted.mocker2.signaling = true;
		}
		checkIfFullyCompleted();
	};
	mocker1.peerConnection.onconnectionstatechange = (e) => {
		console.log(
			"mocker1 signaling state has changed",
			mocker1.peerConnection.connectionState
		);
		if (mocker1.peerConnection.connectionState == "connected") {
			fullyCompleted.mocker1.connection = true;
		}
		checkIfFullyCompleted();
	};
	mocker2.peerConnection.onconnectionstatechange = (e) => {
		console.log(
			"mocker2 signaling state has changed",
			mocker2.peerConnection.connectionState
		);
		if (mocker2.peerConnection.connectionState == "connected") {
			fullyCompleted.mocker2.connection = true;
		}
		checkIfFullyCompleted();
	};
};
main();
