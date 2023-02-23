export enum SocketEmits {
	WAIT_FOR_ROOM = "waitForRoom",
	JOIN_ROOM = "joinRoom",
}

export type JoinRoomReq = {
	userId: string;
};
export interface JoinRoomRes {
	roomId: string;
}
