import { JoinRoomReq, SocketUser } from "@/sockets";
import { Pool, UserPool, type Room, type UserLookup } from "../types";
import * as _ from "lodash";
const userHasRoom = (userId, userLookup: Record<string, UserLookup>) => {
	const roomId = userLookup[userId]?.roomId;
	if (!roomId) {
		console.log("Missing Room Id for User", userId);
		return false;
	}
	return true;
};

const getRoomForUser = (
	userId: string,
	userLookup: Record<string, UserLookup>,
	establishedRooms: Record<string, Room>
) => {
	const roomId = userLookup[userId]?.roomId;
	if (roomId == undefined) {
		console.log("Missing Room Id for User", userId);
		return null;
	}
	const room = establishedRooms[roomId];
	if (room == undefined) {
		console.log(
			"Room does not exist for room id",
			roomId,
			"for user",
			userId
		);
		return null;
	}
	return room;
};

const getLanguagesForUser = (
	userId: string,
	userLookup: Record<string, UserLookup>
) => {
	if (!userLookup[userId]) {
		return null;
	}
	return {
		offering: userLookup[userId].offering,
		seeking: userLookup[userId].seeking,
	};
};

const isHost = (userId, room: Room) => {
	return room.host == userId;
};

// pass by reference for establishedRoom
const rotateHost = (room: Room) => {
	const host = room.host;
	const guest = room.guest;
	const newRoom: Room = {
		...room,
		guest: host,
		host: guest,
	};
	return newRoom;
};

const decrementRoomUsers = (room: Room) => {
	const newRoom: Room = {
		...room,
		numInRoom: room.numInRoom - 1,
	};
	return newRoom;
};

const incrementRoomUsers = (room: Room) => {
	const newRoom: Room = {
		...room,
		numInRoom: room.numInRoom + 1,
	};
	return newRoom;
};

const findLanguageCandidates = (pool: Pool, data: JoinRoomReq) => {
	const offeringPool = pool.offering[data.seeking];
	const seekingPool = pool.seeking[data.offering];
	if (!offeringPool || !seekingPool) {
		return null;
	}

	const candidates: SocketUser[] = [];

	Object.keys(offeringPool).forEach((user: keyof UserPool) => {
		if (seekingPool.hasOwnProperty(user)) {
			candidates.push(offeringPool[user]);
		}
	});
	return candidates;
};

const getRandomCandidate = (candidates: SocketUser[]) => {
	let randomIndex = _.sample(Object.keys(candidates));
	let cand: SocketUser = _.cloneDeep(candidates[randomIndex]);
	return cand;
};

const addToRoom = (
	establishedRooms: Record<string, Room>,
	roomId: string,
	room: Room
) => {
	return {
		...establishedRooms,
		[roomId]: room,
	};
};

const removeFromRoom = (
	establishedRooms: Record<string, Room>,
	roomId: string
) => {
	delete establishedRooms[roomId];
	return establishedRooms;
};

const addToLookUp = (
	userLookUp: Record<string, UserLookup>,
	userId: string,
	lookUp: UserLookup
) => {
	return { ...userLookUp, [userId]: lookUp };
};

const removeFromLookup = (
	userLookup: Record<string, UserLookup>,
	userId: string
) => {
	delete userLookup[userId];
	return userLookup;
};

const addToPool = (
	pool: Pool,
	offeringLang: string,
	seekingLang: string,
	user: SocketUser
) => {
	// can add deep clone here
	const tempPool = pool;
	const offering = tempPool.offering[offeringLang];
	const seeking = tempPool.seeking[seekingLang];
	tempPool.offering[offeringLang] = {
		...offering,
		[user.userId]: user,
	};
	tempPool.seeking[seekingLang] = {
		...seeking,
		[user.userId]: user,
	};
	return tempPool;
};

const removeFromPool = (
	pool: Pool,
	userLookUp: Record<string, UserLookup>,
	userId: string
) => {
	const languages = getLanguagesForUser(userId, userLookUp);
	if (!languages) {
		return pool;
	}
	const { offering, seeking } = languages;
	if (pool[offering]) {
		delete pool[offering][userId];
	}
	if (pool[seeking]) {
		delete pool[seeking][userId];
	}
	return pool;
};

export default {
	decrementRoomUsers,
	getRoomForUser,
	isHost,
	rotateHost,
	userHasRoom,
	incrementRoomUsers,
	getLanguagesForUser,
	findLanguageCandidates,
	getRandomCandidate,
	addToLookUp,
	removeFromLookup,
	addToPool,
	removeFromPool,
	addToRoom,
	removeFromRoom,
};
