import { Socket, io } from "socket.io-client";
import { SocketEmits } from "../../frontend/backend-api/sockets";
import * as wrtc from "wrtc";
import {
	type JoinRoomReq,
	type JoinedRoomReq,
	type PartnerJoinedReq,
	type CandidateFoundReq,
	type SendOfferReq,
	type SendAnswerReq,
} from "../../frontend/backend-api/sockets";
import consts from "./../src/consts";
const servers = {
	iceServers: [
		{
			urls: [
				"stun:stun1.l.google.com:19302",
				"stun:stun2.l.google.com:19302",
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
	polite: boolean;
	makingOffer: boolean;
	constructor(offering: string, seeking: string, userId: string) {
		this.offering = offering;
		this.seeking = seeking;
		console.log("Before socket connected");
		this.socket = io(consts.SOCKET_URL, {
			withCredentials: true,
		});
		console.log("Connected");
		this.peerConnection = new wrtc.RTCPeerConnection(servers);
		this.makingOffer = false;
		this.socket.on(
			SocketEmits.CREATED_ROOM,
			async (data: JoinedRoomReq) => {
				//@ts-ignore
				this.polite.value = data.isPolite;
				this.createOffer();
			}
		);

		this.socket.on(SocketEmits.ASK_POLITENESS, async () => {
			this.socket.emit(SocketEmits.ASK_POLITENESS, {
				myPolite: this.polite,
			});
		});

		this.socket.on(SocketEmits.REJOIN_ROOM, async (data: JoinedRoomReq) => {
			//@ts-ignore
			this.polite.value = data.isPolite;
			this.createOffer();
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
			console.log("received an offer");
			const offeringRightNow =
				this.peerConnection.signalingState !== "stable" &&
				this.makingOffer;
			const denyOffer = this.polite == false && offeringRightNow;
			console.log("denyOffer", denyOffer);
			console.log("offeringRightNow", offeringRightNow);
			if (denyOffer) {
				console.log("Denied Offer");
				return;
			}
			console.log("Accepted Offer");
			this.acceptOffer(data.offer);
		});
		this.socket.on(SocketEmits.EMIT_ANSWER, async (data: SendAnswerReq) => {
			console.log("Accepting answer");
			this.acceptAnswer(data.answer);
		});
	}
	acceptAnswer = async (answer: RTCSessionDescriptionInit) => {
		if (!this.peerConnection.currentRemoteDescription) {
			console.log("accepted answer");
			this.peerConnection.setRemoteDescription(answer);
			this.makingOffer = false;
		}
	};
	createOffer = async () => {
		this.makingOffer = true;
		await this.peerConnection.setLocalDescription();
		const data: SendOfferReq = {
			//@ts-ignore
			offer: this.peerConnection.localDescription,
		};
		this.socket.emit(SocketEmits.EMIT_OFFER, data);
	};

	acceptOffer = async (offer: RTCSessionDescriptionInit) => {
		this.makingOffer = false;
		console.log("at accept offer function");
		await this.peerConnection.setRemoteDescription(offer);

		// let answer = await this.peerConnection.this.createAnswer();
		await this.peerConnection.setLocalDescription();
		console.log("setting answer local description");

		let data: SendAnswerReq = {
			//@ts-ignore
			answer: this.peerConnection.localDescription,
		};
		console.log("emitting answer");
		this.socket.emit(SocketEmits.EMIT_ANSWER, data);
	};
	waitForRoom() {
		const data: JoinRoomReq = {
			userId: this.userId,
			offering: this.seeking,
			seeking: this.offering,
		};
		this.socket.emit(SocketEmits.WAIT_FOR_ROOM, data);
	}
	disconnect() {
		this.socket.close();
		this.peerConnection.close();
	}
}
