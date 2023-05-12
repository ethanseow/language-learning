import assert from "assert";
import { expect } from "chai";
import { RTCMocker } from "./RTCMocker";
import { PoolRepository } from "@/redis/PoolSingleton";
import { RoomRepository, RoomUserRepository } from "@/redis/RoomSingleton";
import pool from "./../src/redis/pool";
import room from "./../src/redis/room";
const offering = "English";
const seeking = "Spanish";
const userId1 = "user1";
const userId2 = "2user";
const mocker1 = new RTCMocker(offering, seeking, userId1);
const mocker2 = new RTCMocker(seeking, offering, userId2);
describe("User", function () {
	this.timeout(10000);
	this.beforeEach(async () => {
		mocker1.disconnect();
		mocker2.disconnect();
		await pool.clearAll();
		await room.clearAll();
	});
	const delay = (time) => {
		return new Promise((resolve) => setTimeout(resolve, time));
	};
	it("joins empty meeting room", async function () {
		mocker1.connect();
		mocker1.waitForRoom();
		await delay(1000);
		const user1 = await pool.findUserInPool(userId1);
		assert.equal(user1.userId, userId1, "user1 id is correct");
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
});
