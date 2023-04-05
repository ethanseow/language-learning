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
	peerConnection: RTCPeerConnection;
	userId: string;
	offering: string;
	seeking: string;
	partnerId: string | null;
	constructor() {
		this.userId = "" + Math.random() * 100000;
		this.offering = consts.LANGUAGE_OFFERING;
		this.seeking = consts.LANGUAGE_SEEKING;
		this.socket = io(consts.SOCKET_API_BASE, {
			withCredentials: true,
		});
		this.partnerId = null;
		this.peerConnection = new wrtc.RTCPeerConnection(servers);

		this.peerConnection.onicecandidate = (
			event: RTCPeerConnectionIceEvent
		) => {
			if (event.candidate) {
				const data: CandidateFoundReq = {
					candidate: event.candidate,
				};
				this.socket.emit(SocketEmits.EMIT_CANDIDATE, data);
			}
		};
		this.socket.on(SocketEmits.JOIN_ROOM, async (data: JoinedRoomReq) => {
			if (this.userId == data.host) {
				this.partnerId = data.guest;
				this.createOffer();
			} else {
				// this.loadAllMessages();
				this.partnerId = data.guest;
			}
		});
		this.socket.on(
			SocketEmits.EMIT_CANDIDATE,
			(data: CandidateFoundReq) => {
				console.log("Got ice candidate");
				if (this.peerConnection) {
					console.log("Adding ice candidate");
					this.peerConnection.addIceCandidate(data.candidate);
				}
			}
		);
		this.socket.on(SocketEmits.EMIT_OFFER, async (data: SendOfferReq) => {
			console.log("Accepting offer");
			this.acceptOffer(data.offer);
		});
		this.socket.on(SocketEmits.EMIT_ANSWER, async (data: SendAnswerReq) => {
			console.log("Accepting answer");
			this.acceptAnswer(data.answer);
		});
	}
	private async createOffer() {
		let offer = await this.peerConnection.createOffer();
		await this.peerConnection.setLocalDescription(offer);
		const data: SendOfferReq = {
			offer,
		};
		this.socket.emit(SocketEmits.EMIT_OFFER, data);
	}
	private async acceptOffer(offer: RTCSessionDescriptionInit) {
		await this.peerConnection.setRemoteDescription(offer);

		let answer = await this.peerConnection.createAnswer();
		await this.peerConnection.setLocalDescription(answer);

		let data: SendAnswerReq = {
			answer,
		};
		this.socket.emit(SocketEmits.EMIT_ANSWER, data);
	}
	private async acceptAnswer(answer: RTCSessionDescriptionInit) {
		if (!this.peerConnection.currentRemoteDescription) {
			this.peerConnection.setRemoteDescription(answer);
		}
	}
	waitForRoom() {
		const data: JoinRoomReq = {
			userId: this.userId,
			offering: this.seeking,
			seeking: this.offering,
		};
		this.socket.emit(SocketEmits.WAIT_FOR_ROOM, data);
	}
}
