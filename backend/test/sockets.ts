import { Session } from "express-session";
import type { IncomingHttpHeaders, IncomingMessage as i } from "http";
export enum SocketEmits {
	WAIT_FOR_ROOM = "waitForRoom",
	JOIN_ROOM = "joinRoom",
	PARTNER_JOINED = "partnerJoined",
	EMIT_CANDIDATE = "emitCandidate",
	EMIT_OFFER = "emitOffer",
	EMIT_ANSWER = "emiteAnswer",
}

export interface JoinRoomReq {
	userId: string;
}

export interface JoinedRoomReq {
	roomId: string;
	isInitiator: boolean;
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
