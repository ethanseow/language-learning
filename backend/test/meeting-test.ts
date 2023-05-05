import assert from "assert";
import { RTCMocker } from "./RTCMocker";
import { PoolRepository } from "@/redis/PoolSingleton";
import { RoomRepository, RoomUserRepository } from "@/redis/RoomSingleton";
import pool from "./../src/redis/pool";
import room from "./../src/redis/room";
const offering = "English";
const seeking = "Spanish";
const userId1 = "user 1";
const userId2 = "2 user";
const mocker1 = new RTCMocker(offering, seeking, userId1);
const mocker2 = new RTCMocker(seeking, offering, userId2);
describe("User", function () {
	this.beforeEach(async () => {
		mocker1.disconnect();
		mocker2.disconnect();
		await pool.clearAll();
		await room.clearAll();
	});

	it("joins empty meeting room", async function () {
		mocker1.waitForRoom();
		const user1 = await pool.findUserInPool(userId1);
		assert.equal(user1.userId, userId1, "user exists");
	});
	it("joins and matches with user", async function () {
		const user1 = await pool.findUserInPool(userId1);
		const user2 = await pool.findUserInPool(userId2);

		assert.equal(user1, undefined, "user1 is undefined");
		assert.equal(user1, null, "user is null");

		assert.equal(user2, undefined, "user2 is undefined");
		assert.equal(user2, null, "user2 is null");

		const roomForUser1 = await room.findRoomForUser(userId1);
		const roomForUser2 = await room.findOtherUserInRoom(userId1);
		assert.equal(roomForUser1.id, roomForUser2, "users join same room");
	});
});
