import { type Room, type UserLookup } from "../types";

const userHasRoom = (userId, usersInRoom: Record<string, string>) => {
	const roomId = usersInRoom[userId];
	if (roomId == undefined) {
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
	const roomId = userLookup[userId].roomId;
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

export default {
	decrementRoomUsers,
	getRoomForUser,
	isHost,
	rotateHost,
	userHasRoom,
	incrementRoomUsers,
	getLanguagesForUser,
};
