export enum SocketEmits {
	WAIT_FOR_ROOM = "waitForRoom",
	JOIN_ROOM = "joinRoom",
	PARTNER_JOINED = "partnerJoined",
	EMIT_CANDIDATE = "emitCandidate",
	EMIT_OFFER = "emitOffer",
	EMIT_ANSWER = "emitAnswer",
	PARTNER_DISCONNECTED = "partnerDisconnected",
	GET_ALL_MESSAGES = "getAllMessages",
	SEND_MESSAGE = "sendMessage",
	SHARE_SCREEN = "shareScreen",
}
export enum SocketNamespaces {
	WEB_RTC = "/webRtc",
	TEXT_CHAT = "/textChat",
}
export interface JoinRoomReq {
	userId: string;
}

export type Message = {
	ownerId: string;
	id: string;
	timestamp: Date;
	data: string;
};

export interface GetAllMessagesRes {
	messsages: Message[];
}

export interface JoinedRoomReq {
	roomId: string;
	host: string;
	guest: string;
}
export interface PartnerJoinedReq {
	partnerUserId: string;
}
export interface CandidateFoundReq {
	candidate: RTCIceCandidate;
}
export interface SendOfferReq {
	offer: RTCSessionDescriptionInit;
}

export interface SendAnswerReq {
	answer: RTCSessionDescriptionInit;
}

export interface SocketUser {
	userId: string;
	socketId: string;
}
