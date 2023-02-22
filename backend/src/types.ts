export interface JoinRoomReq {
	userId: number;
}
export interface JoinRoomRes {
	roomId: number;
	receivedParter: boolean;
}
export enum routes {
	JOIN_ROOM = "/join-room",
}
