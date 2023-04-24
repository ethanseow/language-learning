import { JoinRoomReq, JoinedRoomReq, SocketEmits, SocketUser } from "@/sockets";
import { Pool, UserPool, type Room, type UserLookup } from "../types";
import * as _ from "lodash";
import { Server, Socket } from "socket.io";
const userHasRoom = (userId, userLookup: Record<string, UserLookup>) => {
	const roomId = userLookup[userId]?.roomId;
	if (!roomId) {
		console.log("Missing Room Id for User", userId);
		return false;
	}
	return !userLookup[userId].hasLeftRoom;
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

const userLeavesRoomLookUp = (
	userLookUp: Record<string, UserLookup>,
	userId: string
) => {
	userLookUp[userId].hasLeftRoom = true;
	return userLookUp;
};

const removeFromLookup = (
	userLookup: Record<string, UserLookup>,
	userId: string
) => {
	delete userLookup[userId];
	return userLookup;
};

const isUserInPool = (userId: string, pool: Pool) => {
	return pool.usersInPool.has(userId);
};

const addToPool = (
	pool: Pool,
	offeringLang: string,
	seekingLang: string,
	user: SocketUser
) => {
	// can add deep clone here
	const tempPool = _.cloneDeep(pool);
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
	tempPool.usersInPool.add(user.userId);
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
	if (pool.usersInPool.has(userId)) {
		pool.usersInPool.delete(userId);
	}
	return pool;
};

const joinRoomFlow = async (
	data: JoinRoomReq,
	reverseUserLookup: Record<string, UserLookup>,
	pool: Pool,
	establishedRooms: Record<string, Room>,
	socket: Socket,
	io: Server
) => {
	const userId = data.userId;
	if (userHasRoom(userId, reverseUserLookup)) {
		reverseUserLookup[userId].hasLeftRoom = false;
		const room = getRoomForUser(
			userId,
			reverseUserLookup,
			establishedRooms
		);
		const data: JoinedRoomReq = {
			roomId: room.id,
			host: room.host,
			guest: room.guest,
		};
		socket.join(room.id);
		console.log("Joining Existing Room", room.id);
		establishedRooms[room.id] = incrementRoomUsers(room);
		io.to(room.id).emit(SocketEmits.JOIN_ROOM, data);
	} else {
		if (isUserInPool(userId, pool)) {
			console.log(
				"User is already in pool - cannot join two pools twice"
			);
			return;
		}
		const candidates = findLanguageCandidates(pool, data);
		if (candidates) {
			console.log("Found compatible partner, placing in pool");
			let randomRoomId =
				String(Math.round(Math.random() * 1000000)) +
				"_" +
				String(Math.round(Math.random() * 1000000));
			const randomUser = getRandomCandidate(candidates);
			if (randomUser.socketId == socket.id) {
				return;
			}
			const room: Room = {
				id: randomRoomId,
				host: randomUser.userId,
				guest: userId,
				numInRoom: 2,
				messages: [],
			};
			establishedRooms = addToRoom(establishedRooms, randomRoomId, room);
			reverseUserLookup = addToLookUp(reverseUserLookup, userId, {
				offering: data.offering,
				seeking: data.seeking,
				roomId: randomRoomId,
				hasLeftRoom: false,
			});
			reverseUserLookup[randomUser.userId].roomId = randomRoomId;
			let s = await io.in(randomUser.socketId).fetchSockets();
			if (s.length == 0) {
				return;
			}
			let waitingSocket = s[0];
			pool = removeFromPool(pool, reverseUserLookup, randomUser.userId);
			socket.join(randomRoomId);
			waitingSocket.join(randomRoomId);
			const sioData: JoinedRoomReq = {
				roomId: randomRoomId,
				host: room.host,
				guest: room.guest,
			};
			io.to(randomRoomId).emit(SocketEmits.JOIN_ROOM, sioData);
			console.log("Offering after room creation", pool.offering);
			console.log("Seeking after room creation", pool.seeking);
		} else {
			console.log("Room is unavailable, putting in pool");
			const user: SocketUser = {
				userId,
				socketId: socket.id,
			};

			pool = addToPool(pool, data.offering, data.seeking, user);
			reverseUserLookup = addToLookUp(reverseUserLookup, userId, {
				offering: data.offering,
				seeking: data.seeking,
				roomId: null,
				hasLeftRoom: false,
			});
			console.log("Offering after pool placement", pool.offering);
			console.log("Seeking after pool placement", pool.seeking);
		}
	}
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
	isUserInPool,
	userLeavesRoomLookUp,
	joinRoomFlow,
};
