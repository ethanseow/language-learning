import assert from "assert";
import { expect } from "chai";
import { RTCMocker } from "./RTCMocker";
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
describe("RTC user", function () {
	this.timeout(5000);
	this.beforeEach(async () => {
		mocker1.disconnect();
		mocker2.disconnect();
		await delay(1000);
		await pool.clearAll();
		await room.clearAll();
	});
	const delay = (time) => {
		return new Promise((resolve) => setTimeout(resolve, time));
	};
	it("joins a filled pool, joins a room, RTCConnects, leaves", function (done) {
		const main = async () => {
			mocker1.rtcConnect();
			mocker1.socketConnect();
			mocker1.waitForRoom();
			await delay(250);
			mocker2.rtcConnect();
			mocker2.socketConnect();
			mocker2.waitForRoom();
			await delay(250);

			const leaveRoom = () => {
				return new Promise(async (resolve) => {
					mocker1.leaveRoom();
					await delay(250);
					resolve(1);
				});
			};

			const rejoinRoom = () => {
				return new Promise(async (resolve) => {
					mocker1.rtcConnect();
					mocker1.socketConnect();
					mocker1.waitForRoom();
					await delay(250);
					console.log(
						"setTimeout - before finding valid room for userId1"
					);
					const r = await room.findRoomForUser(userId1);
					console.log(
						"setTimeout - after finding valid room for userId1"
					);
					console.log("setTimeout - before finding room users for r");
					const roomUser = await room.findUsersForRoom(r);
					console.log("setTimeout - room for userId1", r);
					console.log("setTimeout - room.users for userId1", r.users);
					console.log("setTimeout - roomUsers for r", roomUser);
					console.log("setTimeout - after finding room users for r");
					if (roomUser[userId1].isActive != true) {
						console.log("roomUser for userId1 is active - FAILED");
						return;
					}
					console.log("roomUser for userId1 is active - GOOD");
					if (r.numInRoom != 2) {
						console.log("num users in room is 2 - FAILED");
						return;
					}
					console.log("num users in room is 2 - GOOD");
					done();
				});
			};
			leaveRoom().then(() => {
				rejoinRoom();
			});

			/*
			setTimeout(async () => {
				mocker1.leaveRoom();
				await delay(250);
				mocker1.rtcConnect();
				mocker1.socketConnect();
				mocker1.waitForRoom();
				await delay(250);

				console.log(
					"setTimeout - before finding valid room for userId1"
				);
				const r = await room.findRoomForUser(userId1);
				console.log(
					"setTimeout - after finding valid room for userId1"
				);
				console.log("setTimeout - before finding room users for r");
				const roomUser = await room.findUsersForRoom(r);
				console.log("setTimeout - room for userId1", r);
				console.log("setTimeout - room.users for userId1", r.users);
				console.log("setTimeout - roomUsers for r", roomUser);
				console.log("setTimeout - after finding room users for r");
				expect(roomUser[userId1].isActive).to.equal(true);
				console.log("roomUser for userId1 is active - GOOD");
				expect(r.numInRoom == 2);
				console.log("num users in room is 2 - GOOD ");
				if (roomUser[userId1].isActive == true) {
					console.log("roomUser for userId1 is active");
					if (r.numInRoom == 2) {
						console.log("num users in room is 2");
					}
				}
			}, 3000);*/
		};
		main();
	});
	return;
	it("joins a filled pool, joins a room, RTCConnects, and leaves", function (done) {
		const main = async () => {
			mocker1.rtcConnect();
			mocker1.socketConnect();
			mocker1.waitForRoom();
			await delay(250);
			mocker2.rtcConnect();
			mocker2.socketConnect();
			mocker2.waitForRoom();
			await delay(250);

			setTimeout(async () => {
				mocker1.leaveRoom();
				await delay(250);

				console.log(
					"setTimeout - before finding valid room for userId1"
				);
				const r = await room.findRoomForUser(userId1);
				console.log(
					"setTimeout - after finding valid room for userId1"
				);
				console.log("setTimeout - before finding room users for r");
				const roomUser = await room.findUsersForRoom(r);
				console.log("setTimeout - room for userId1", r);
				console.log("setTimeout - room.users for userId1", r.users);
				console.log("setTimeout - roomUsers for r", roomUser);
				console.log("setTimeout - after finding room users for r");
				if (roomUser[userId1].isActive == false) {
					console.log("roomUser for userId1 is inactive");
					if (r.numInRoom == 1) {
						console.log("num users in room is 1");
						done();
					}
				}
			}, 3000);
		};
		main();
	});
	it("joins empty meeting room", async function () {
		mocker1.socketConnect();
		mocker1.waitForRoom();
		await delay(1000);
		const user1 = await pool.findUserInPool(userId1);
		assert.equal(user1?.userId, userId1, "user1 id is correct");
	});
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
	it("joins and matches with user", async function () {
		mocker1.rtcConnect();
		mocker1.socketConnect();
		mocker1.waitForRoom();
		await delay(1000);
		mocker2.rtcConnect();
		mocker2.socketConnect();
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
			mocker1.rtcConnect();
			mocker1.socketConnect();
			mocker1.waitForRoom();
			await delay(1000);
			mocker2.rtcConnect();
			mocker2.socketConnect();
			mocker2.waitForRoom();
			setTimeout(() => {
				if (mocker1.peerConnection.signalingState == "stable") {
					if (mocker1.peerConnection.connectionState == "connected") {
						if (mocker2.peerConnection.signalingState == "stable") {
							if (
								mocker2.peerConnection.connectionState ==
								"connected"
							) {
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
