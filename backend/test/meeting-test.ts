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
const mocker1 = new RTCMocker(offering, seeking, userId1);
const mocker2 = new RTCMocker(seeking, offering, userId2);

describe("User", function () {
	this.timeout(5000);
	this.beforeEach(async () => {
		/*
		mocker1.disconnect();
		mocker2.disconnect();
		await delay(1000);
		await pool.clearAll();
		await room.clearAll();
        */
	});
	const delay = (time) => {
		return new Promise((resolve) => setTimeout(resolve, time));
	};
	false &&
		it("joins empty meeting room", async function () {
			mocker1.connect();
			mocker1.waitForRoom();
			await delay(1000);
			const user1 = await pool.findUserInPool(userId1);
			assert.equal(user1.userId, userId1, "user1 id is correct");
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
		it("tests out done in mocha", function (done) {
			setTimeout(() => {
				console.log("finished with test");
				done();
			}, 3000);
		});
	it("tests out passing worker data to a worker.ts file", function (done) {
		const worker = new Worker("./worker.js", {
			workerData: {
				value: 15,
				path: "./test-worker.ts",
			},
		});
		worker.on("message", (data) => {
			console.log("Received data from worker", data.value);
			done();
		});
	});
	false &&
		it("joins, matches into a room, and establishes RTC connection", function (done) {
			/*
			mocker1.connect();
			mocker1.waitForRoom();
			await delay(1000);
			mocker2.connect();
			mocker2.waitForRoom();
			await delay(3000);
            */

			const worker1 = new Worker("./worker.js", {
				workerData: {
					offering,
					seeking,
					userId: userId1,
					path: "./RTCMocker.ts",
				},
			});
			const worker2 = new Worker("./worker.js", {
				workerData: {
					seeking: offering,
					offering: seeking,
					userId: userId2,
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
		});
});
