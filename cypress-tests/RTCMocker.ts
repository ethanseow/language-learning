import { Socket, io } from "socket.io-client";
import { SocketEmits } from "../frontend/backend-api/sockets";
import * as wrtc from "wrtc";
import {
	type JoinRoomReq,
	type JoinedRoomReq,
	type PartnerJoinedReq,
	type CandidateFoundReq,
	type SendOfferReq,
	type SendAnswerReq,
	type Message,
	SocketNamespaces,
} from "../frontend/backend-api/sockets";
import consts from "./consts";
import test from "./test";
const servers = {
	iceServers: [
		{
			urls: [
				"stun:stun1.l.google.com:19302",
				//"stun:stun2.l.google.com:19302",
			],
		},
	],
};
export class RTCMocker {
	socket: Socket;
	constructor() {
		this.socket = io(consts.SOCKET_API_BASE, {
			withCredentials: true,
		});
		this.socket.on(SocketEmits.JOIN_ROOM, async (data: JoinedRoomReq) => {
			startConnection();
			roomId.value = data.roomId;
			if (userId.value == data.host) {
				partnerId.value = data.guest;
				console.log("I am the host");
				console.log("creating offer");
				createOffer();
			} else {
				loadAllMessages();
				console.log("I am the guest");
				partnerId.value = data.guest;
			}
		});
		this.socket.on(
			SocketEmits.EMIT_CANDIDATE,
			(data: CandidateFoundReq) => {
				console.log("Got ice candidate");
				if (peerConnection.value) {
					console.log("Adding ice candidate");
					peerConnection.value.addIceCandidate(data.candidate);
				}
			}
		);
		this.socket.on(SocketEmits.EMIT_OFFER, async (data: SendOfferReq) => {
			console.log("Accepting offer");
			acceptOffer(data.offer);
		});
		this.socket.on(SocketEmits.EMIT_ANSWER, async (data: SendAnswerReq) => {
			console.log("Accepting answer");
			acceptAnswer(data.answer);
		});
		this.socket.on(SocketEmits.PARTNER_DISCONNECTED, () => {
			stopConnection();
		});
		this.socket.on(SocketEmits.SEND_MESSAGE, (message: Message) => {
			console.log("Previous allMessage", allMessages.value);
			allMessages.value.push(message);
			console.log("Appended allMessage", allMessages.value);
		});
	}
}
