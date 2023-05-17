import assert from "assert";
import { expect } from "chai";
import { RTCMocker } from "./RTCMocker";
import { PoolRepository } from "@/redis/PoolSingleton";
import { RoomRepository, RoomUserRepository } from "@/redis/RoomSingleton";
import pool from "./../src/redis/pool";
import room from "./../src/redis/room";
import { Worker, parentPort } from "worker_threads";
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
/*
const main = async () => {
	await pool.clearAll();
	await room.clearAll();
	mocker1.rtcConnect();
	mocker1.connect();
	mocker1.waitForRoom();
	await delay(1000);
	mocker2.rtcConnect();
	mocker2.connect();
	mocker2.waitForRoom();

	console.log("here");
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
	setTimeout(() => {
		console.log("in settimeout - checking rtcs");
		if (mocker1.peerConnection.signalingState == "stable") {
			console.log("mocker1 signaling state GOOD");
			if (mocker1.peerConnection.connectionState == "connected") {
				console.log("mocker1 connection state GOOD");
				if (mocker2.peerConnection.signalingState == "stable") {
					console.log("mocker2 signaling state GOOD");
					if (mocker2.peerConnection.connectionState == "connected") {
						console.log("mocker2 connection state GOOD");
						console.log("Done with test case");
					}
				}
			}
		}
	}, 3000);
};
main();
*/

const workers = [];
describe("User", function () {
	this.timeout(10000);
	/*
	this.beforeEach(async () => {
		mocker1.disconnect();
		mocker2.disconnect();
		await delay(1000);
		await pool.clearAll();
		await room.clearAll();
	});
    */
	const delay = (time) => {
		return new Promise((resolve) => setTimeout(resolve, time));
	};
	false &&
		it("joins empty meeting room", async function () {
			mocker1.connect();
			mocker1.waitForRoom();
			await delay(1000);
			const user1 = await pool.findUserInPool(userId1);
			assert.equal(user1?.userId, userId1, "user1 id is correct");
		});
	false &&
		it("adds to pool redis and finds compatible user", async () => {
			const user1 = {
				offering: "offering",
				seeking: "seeking",
				socketId: "socket id",
				userId: "user id 1",
			};
			const user2 = {
				offering: "seeking",
				seeking: "offering",
				socketId: "socket id",
				userId: "user id 2",
			};
			await pool.addToPool(user1);
			await pool.addToPool(user2);
			const otherUser = await pool.getCompatibleUser(user1);
			expect(otherUser.userId).to.equal(
				user2.userId,
				"found compatible other user"
			);
		});
	false &&
		it("joins and matches with user", async function () {
			mocker1.connect();
			mocker1.waitForRoom();
			await delay(1000);
			mocker2.connect();
			mocker2.waitForRoom();
			await delay(1000);

			const user1 = await pool.findUserInPool(userId1);
			const user2 = await pool.findUserInPool(userId2);

			expect(user1).to.be.oneOf(
				[null, undefined],
				"user 1 is removed from pool"
			);
			expect(user2).to.be.oneOf(
				[null, undefined],
				"user 2 is removed from pool"
			);

			const r = await room.findRoomForUser(userId1);
			expect(r).to.not.be.oneOf(
				[null, undefined],
				"room is present for the user"
			);

			expect(r.users).to.contain(userId1, "user1 is in the room");
			expect(r.users).to.contain(userId2, "user2 is in the room");
		});
	false &&
		it("joins, matches into a room, and establishes RTC connection", function (done) {
			/*
		const main = async () => {
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
        */
			const worker1 = new Worker("./worker.js", {
				workerData: {
					offering,
					seeking,
					userId: userId1,
					cookie: authCookie1,
					path: "./RTCMocker.ts",
				},
			});
			const worker2 = new Worker("./worker.js", {
				workerData: {
					seeking: offering,
					offering: seeking,
					userId: userId2,
					cookie: authCookie2,
					path: "./RTCMocker.ts",
				},
			});
			const checkIfFullyCompleted = () => {
				Object.keys(fullyCompleted).forEach((key) => {
					if (fullyCompleted[key] == false) {
						return false;
					}
				});
				done();
				return true;
			};
			const fullyCompleted = {
				worker1: false,
				worker2: false,
			};
			worker1.on("message", (data) => {
				if (data?.completed) {
					fullyCompleted.worker1 = true;
					checkIfFullyCompleted();
				}
			});
			worker2.on("message", (data) => {
				if (data?.completed) {
					fullyCompleted.worker1 = true;
					checkIfFullyCompleted();
				}
			});
			worker1.unref();
			worker2.unref();
		});
	it("joins, matches into a room, and establishes RTC connection", function (done) {
		const offering = "English";
		const seeking = "Spanish";
		const userId1 = "user1";
		const userId2 = "2user";
		const authCookie1 = "cookie1";
		const authCookie2 = "cookie2";
		const mocker1 = new RTCMocker(offering, seeking, userId1, authCookie1);
		const mocker2 = new RTCMocker(seeking, offering, userId2, authCookie2);
		const main = async () => {
			await pool.clearAll();
			await room.clearAll();
			mocker1.rtcConnect();
			mocker1.connect();
			mocker1.waitForRoom();
			await delay(1000);
			mocker2.rtcConnect();
			mocker2.connect();
			mocker2.waitForRoom();

			console.log("here");
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
			setTimeout(() => {
				console.log("in settimeout - checking rtcs");
				if (mocker1.peerConnection.signalingState == "stable") {
					console.log("mocker1 signaling state GOOD");
					if (mocker1.peerConnection.connectionState == "connected") {
						console.log("mocker1 connection state GOOD");
						if (mocker2.peerConnection.signalingState == "stable") {
							console.log("mocker2 signaling state GOOD");
							if (
								mocker2.peerConnection.connectionState ==
								"connected"
							) {
								console.log("mocker2 connection state GOOD");
								console.log("Done with test case");
								done();
							}
						}
					}
				}
			}, 3000);
		};
		main();
	});
});
