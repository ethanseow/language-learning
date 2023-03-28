import { type Message, type SocketUser } from "./sockets";

export type Room = {
	id: string;
	host: string;
	guest: string;
	numInRoom: number;
	messages: Message[];
};

export type UserPool = Record<string, SocketUser>;

export type Pool = {
	offering: Record<string, UserPool>;
	seeking: Record<string, UserPool>;
};

export interface UserLookup {
	roomId: string;
	offering: string;
	seeking: string;
}
