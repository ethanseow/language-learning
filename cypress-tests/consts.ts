import { type Pool, type Room, type UserLookup } from "../backend/src/types";
import { type JoinRoomReq } from "../backend/src/sockets";
const LANGUAGE_SEEKING = "English";
const LANGUAGE_OFFERING = "Mandarin";
const TESTING_USERID = "I am a userid";
const TESTING_ROOMID = "This is a room id";
const TESTING_SOCKETID = "This is my socket id";
const TESTING_USERLOOKUP: Record<string, UserLookup> = {
	//@ts-ignore
	[TESTING_USERID]: {
		roomId: TESTING_ROOMID,
		offering: LANGUAGE_OFFERING,
		seeking: LANGUAGE_SEEKING,
	},
};
const TESTING_POOL: Pool = {
	offering: {
		[LANGUAGE_OFFERING]: {
			//@ts-ignore
			[TESTING_USERID]: {
				userId: TESTING_USERID,
				socketId: TESTING_SOCKETID,
			},
		},
	},
	seeking: {
		[LANGUAGE_SEEKING]: {
			//@ts-ignore
			[TESTING_USERID]: {
				userId: TESTING_USERID,
				socketId: TESTING_SOCKETID,
			},
		},
	},
};

export default {
	LANGUAGE_SEEKING,
	LANGUAGE_OFFERING,
	SOCKET_API_BASE: "http://localhost:4000",
	WEBSITE_BASE: "http://localhost:3000",

	TESTING_USERID,
	TESTING_ROOMID,
	TESTING_POOL,
	TESTING_USERLOOKUP,
	TESTING_SOCKETID,
};
