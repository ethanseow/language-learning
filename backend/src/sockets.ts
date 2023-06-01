export enum SocketEmits {
	WAIT_FOR_ROOM = "waitForRoom",
	JOIN_ROOM = "joinRoom",
	PARTNER_JOINED = "partnerJoined",
	EMIT_CANDIDATE = "emitCandidate",
	EMIT_OFFER = "emitOffer",
	EMIT_ANSWER = "emitAnswer",
	EMIT_DESC = "emitDescription",
	PARTNER_DISCONNECTED = "partnerDisconnected",
	GET_ALL_MESSAGES = "getAllMessages",
	SEND_MESSAGE = "sendMessage",
	SHARE_SCREEN = "shareScreen",
	CREATED_ROOM = "createdRoom",
	ASK_POLITENESS = "askPoliteness",
	REJOIN_ROOM = "rejoinRoom",
	END_MEETING = "endMeeting",
	TRIGGER_END_MEETING = "triggerEndMeeting",
}
export enum SocketNamespaces {
	WEB_RTC = "/webRtc",
	TEXT_CHAT = "/textChat",
}
export interface JoinRoomReq {
	userId: string;
	offering: string;
	seeking: string;
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

export type JoinedRoomReq = {
	roomId: string;
	isPolite: boolean;
};
export interface PartnerJoinedReq {
	isPolite: boolean;
}

export interface AskForPoliteness {
	myPolite: boolean | null;
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

export interface SendDesc {
	description: RTCSessionDescriptionInit;
}

export interface SocketUser {
	userId: string;
	socketId: string;
}
