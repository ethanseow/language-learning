export interface JoinRoomReq {
	userId: string;
}
export interface JoinRoomRes {
	roomId: string;
}

export interface SocketUser {
	userId: string;
	socketId: string;
}
export enum routes {
	JOIN_ROOM = "/join-room",
}
