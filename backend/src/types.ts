import { type Message, type SocketUser } from "./sockets";

export type RoomUser =
	| {
			isActive: boolean;
	  } & User;

export type Room = {
	id: string;
	users: Record<string, RoomUser>;
	numInRoom: number;
	messages: Message[];
};

export type Rooms = {
	establishedRooms: Record<string, Room>;
	roomLookup: Record<string, Room>;
	createRoom: (user1: User, user2: User) => Room;
	findOtherUserInRoom: (user: string) => User | null;
	rejoinRoom: (user: User) => Room | null;
	leaveRoom: (user: string) => Room | null;
	closeRoom: (roomId: string) => Room | null;
	findRoomForUser: (user: string) => Room | null;
};

export type User = {
	offering: string;
	seeking: string;
	userId: string;
	socketId: string;
};

export type UserPool = Record<string, User>;

export type Pool = {
	offering: Record<string, UserPool>;
	seeking: Record<string, UserPool>;
	userLookup: Record<string, User>;
	addToPool: (user: User) => User;
	removeFromPool: (userId: string) => User | null;
	findUserInPool: (userId: string) => User | null;
	getCompatibleUser: (user: User) => User | null;
};

export interface UserLookup {
	roomId: string;
	offering: string;
	seeking: string;
	hasLeftRoom: boolean;
}
