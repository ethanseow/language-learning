import { type Message } from "./sockets";
export type Room = {
	id: string;
	host: string;
	guest: string;
	numInRoom: number;
	messages: Message[];
};
