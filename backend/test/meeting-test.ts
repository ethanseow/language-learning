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
	it("joins a filled pool, joins a room, RTCConnects, leaves, and rejoins", function (done) {
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

				const r = await room.findRoomForUser(userId1);
				const roomUser = await room.findUsersForRoom(r);
				expect(roomUser[userId1].isActive).to.equal(
					false,
					"roomUser for userId1 is inactive"
				);

				expect(r.numInRoom).to.equal(1, "num users in room is 1");
				done();
			}, 3000);
		};
		main();
	});
	return;
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
			await pool.clearAll();
			await room.clearAll();
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
