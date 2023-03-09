import { type Room } from "../types";

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
	usersInRoom: Record<string, string>,
	establishedRooms: Record<string, Room>
) => {
	const roomId = usersInRoom[userId];
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

export default {
	decrementRoomUsers,
	getRoomForUser,
	isHost,
	rotateHost,
	userHasRoom,
};
