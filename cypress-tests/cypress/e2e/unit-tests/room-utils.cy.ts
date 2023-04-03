import consts from "../../../consts";
import {
	type Pool,
	type Room,
	type UserLookup,
} from "../../../../backend/src/types";
import utils from "../../../../backend/src/utils/room";
import { type JoinRoomReq } from "../../../../backend/src/sockets";
describe("room utils for partner pairings", () => {
	it("gets the true positive result for userHasRoom", () => {
		const userId = [consts.TESTING_USERID];

		const userLookUp: Record<string, UserLookup> = {
			[consts.TESTING_USERID]: {
				roomId: consts.TESTING_ROOMID,
				offering: consts.LANGUAGE_OFFERING,
				seeking: consts.LANGUAGE_SEEKING,
			},
		};
		expect(utils.userHasRoom(userId, userLookUp)).to.equal(true);
	});
	it("gets the true NEGATIVE result for userHasRoom", () => {
		const userLookUp: Record<string, UserLookup> = {};
		expect(utils.userHasRoom(consts.TESTING_USERID, userLookUp)).to.equal(
			false
		);
	});
	it("gets the user from their room (it exists)", () => {
		const userId = consts.TESTING_USERID;
		const userLookUp: Record<string, UserLookup> = {
			[consts.TESTING_USERID]: {
				roomId: consts.TESTING_ROOMID,
				offering: consts.LANGUAGE_OFFERING,
				seeking: consts.LANGUAGE_SEEKING,
			},
		};
		const room = {
			guest: "i am a guest",
			host: "i am a host",
			id: consts.TESTING_ROOMID,
			messages: [],
			numInRoom: 2,
		};

		const establishedRooms: Record<string, Room> = {
			[consts.TESTING_ROOMID]: room,
		};
		expect(
			utils.getRoomForUser(userId, userLookUp, establishedRooms)
		).to.deep.equal(room);
	});
	it("does not get the room given that the room is undefined", () => {
		const userId = consts.TESTING_USERID;
		const userLookUp: Record<string, UserLookup> = {
			[consts.TESTING_USERID]: {
				roomId: consts.TESTING_ROOMID,
				offering: consts.LANGUAGE_OFFERING,
				seeking: consts.LANGUAGE_SEEKING,
			},
		};

		const establishedRooms: Record<string, Room> = {};
		expect(
			utils.getRoomForUser(userId, userLookUp, establishedRooms)
		).to.equal(null);
	});
	it("does not get the room given that the roomId in userLookup is undefined", () => {
		const userId = consts.TESTING_USERID;
		const userLookUp: Record<string, UserLookup> = {};
		const room = {
			guest: "i am a guest",
			host: "i am a host",
			id: consts.TESTING_ROOMID,
			messages: [],
			numInRoom: 2,
		};

		const establishedRooms: Record<string, Room> = {
			[consts.TESTING_ROOMID]: room,
		};
		expect(
			utils.getRoomForUser(userId, userLookUp, establishedRooms)
		).to.equal(null);
	});

	it("gets the language of the user", () => {
		const userId = consts.TESTING_USERID;

		const userLookUp: Record<string, UserLookup> = {
			[consts.TESTING_USERID]: {
				roomId: consts.TESTING_ROOMID,
				offering: consts.LANGUAGE_OFFERING,
				seeking: consts.LANGUAGE_SEEKING,
			},
		};
		const ans = {
			offering: consts.LANGUAGE_OFFERING,
			seeking: consts.LANGUAGE_SEEKING,
		};

		expect(utils.getLanguagesForUser(userId, userLookUp)).to.deep.equal(
			ans
		);
	});

	it("gets the language of the user given that the user is not in the lookup", () => {
		const userId = "I am a user";

		const userLookUp: Record<string, UserLookup> = {};

		expect(utils.getLanguagesForUser(userId, userLookUp)).to.equal(null);
	});

	it("finds language candidates given they exist", () => {
		const pool = consts.TESTING_POOL;
		const data: JoinRoomReq = {
			offering: consts.LANGUAGE_SEEKING,
			seeking: consts.LANGUAGE_OFFERING,
			userId: consts.TESTING_USERID,
		};
		expect(utils.findLanguageCandidates(pool, data)).to.deep.equal([
			{
				userId: consts.TESTING_USERID,
				socketId: consts.TESTING_SOCKETID,
			},
		]);
	});
	it("cannot find language candidate", () => {
		const pool: Pool = { offering: {}, seeking: {} };
		const data: JoinRoomReq = {
			offering: consts.LANGUAGE_SEEKING,
			seeking: consts.LANGUAGE_OFFERING,
			userId: consts.TESTING_USERID,
		};
		expect(utils.findLanguageCandidates(pool, data)).to.equal(null);
	});
	it("finds a random candidate that matches", () => {
		const pool = consts.TESTING_POOL;
		const data: JoinRoomReq = {
			offering: consts.LANGUAGE_SEEKING,
			seeking: consts.LANGUAGE_OFFERING,
			userId: consts.TESTING_USERID,
		};
		const candidates = utils.findLanguageCandidates(pool, data);
		expect(utils.getRandomCandidate(candidates)).to.deep.equal(
			candidates[0]
		);
	});

	it("adds a user to the look up", () => {
		const lookup: UserLookup = {
			offering: consts.LANGUAGE_OFFERING,
			seeking: consts.LANGUAGE_SEEKING,
			roomId: consts.TESTING_ROOMID,
		};
		const userId = consts.TESTING_USERID;
		const userLookup = consts.TESTING_USERLOOKUP;
		expect(utils.addToLookUp(userLookup, userId, lookup)).to.deep.equal({
			...userLookup,
			[userId]: lookup,
		});
	});
});
