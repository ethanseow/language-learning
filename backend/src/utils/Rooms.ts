import { Room, Rooms, User } from "@/types";
import * as _ from "lodash";
export const rooms: Rooms = {
	establishedRooms: {},
	roomLookup: {},
	findRoomForUser: (user: string) => {
		const roomForUser = rooms.roomLookup[user];
		if (roomForUser) {
			return { ...roomForUser };
		}
		return null;
	},
	createRoom: (user1: User, user2: User) => {
		let randomRoomId =
			String(Math.round(Math.random() * 1000000)) +
			"_" +
			String(Math.round(Math.random() * 1000000));

		const room: Room = {
			numInRoom: 2,
			id: randomRoomId,
			users: {
				[user1.userid]: {
					userId: user1.userid,
					isActive: true,
				},
				[user2.userid]: {
					userId: user2.userid,
					isActive: true,
				},
			},
			messages: [],
		};
		rooms.roomLookup[user1.userid] = room;
		rooms.roomLookup[user2.userid] = room;
		rooms.establishedRooms[randomRoomId] = room;
		return { ...room };
	},
	rejoinRoom: (user: User) => {
		const room = rooms.findRoomForUser(user.userid);
		if (room) {
			// actual room by reference
			const referencedRoom = rooms.establishedRooms[room.id];
			if (referencedRoom.users[user.userid].isActive) {
				return null;
			}
			referencedRoom.numInRoom += 1;
			referencedRoom.users[user.userid].isActive = true;
			return room;
		} else {
			return null;
		}
	},
	leaveRoom: (userId: string) => {
		const room = rooms.findRoomForUser(userId);
		if (room) {
			// actual room by reference
			const referencedRoom = rooms.establishedRooms[room.id];
			if (!referencedRoom.users[userId].isActive) {
				return null;
			}
			referencedRoom.numInRoom -= 1;
			referencedRoom.users[userId].isActive = false;
			if (referencedRoom.numInRoom <= 0) {
				rooms.closeRoom(room.id);
			}
			return room;
		} else {
			return null;
		}
	},
	closeRoom: (roomId: string) => {
		const room = { ...rooms.establishedRooms[roomId] };
		if (room) {
			delete rooms.roomLookup[roomId];
			delete rooms.establishedRooms[roomId];
			return room;
		} else {
			return null;
		}
	},
};
