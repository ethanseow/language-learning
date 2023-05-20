import { Socket, io } from "socket.io-client";
import { SendDesc, SocketEmits } from "../../backend/src/sockets";
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
	RTCSignalingState: string;
	RTCConnectionState: string;
	cookie: string;
	createdRoomLatch: boolean;
	constructor(
		offering: string,
		seeking: string,
		userId: string,
		cookie: string
	) {
		this.cookie = cookie;
		this.userId = userId;
		this.offering = offering;
		this.seeking = seeking;
		this.makingOffer = false;
		this.createdRoomLatch = false;
		this.peerConnection = new wrtc.RTCPeerConnection(servers);
	}
	setRTCConnectionState(state: string) {
		this.RTCConnectionState = state;
	}
	setRTCSignalingState(state: string) {
		console.log(
			"userId:",
			this.userId,
			"setSignalingState triggered:",
			state
		);
		this.RTCSignalingState = state;
	}
	rtcConnect() {
		this.peerConnection.onsignalingstatechange = (e) => {
			switch (this.peerConnection.signalingState) {
				case "have-remote-offer":
					this.setRTCSignalingState("stable");
					break;
				case "have-local-offer":
					this.setRTCSignalingState("stable");
					break;
				case "closed":
					this.setRTCSignalingState("stable");
					break;
				case "have-local-pranswer":
					this.setRTCSignalingState("stable");
					break;
				case "have-remote-pranswer":
					this.setRTCSignalingState("stable");
					break;
				case "stable":
					this.setRTCSignalingState("stable");
					break;
				default:
					break;
			}
		};
		// not being called because we are not sending anything over?
		this.peerConnection.onconnectionstatechange = (e) => {
			switch (this.peerConnection.connectionState) {
				case "new":
					this.setRTCConnectionState("new");
					break;
				case "connecting":
					this.setRTCConnectionState("connecting");
					break;
				case "connected":
					this.setRTCConnectionState("connected");
					break;
				case "disconnected":
					this.setRTCConnectionState("disconnected");
					break;
				case "closed":
					this.setRTCConnectionState("closed");
					break;
				case "failed":
					this.setRTCConnectionState("failed");
					break;
				default:
					break;
			}
		};
		this.peerConnection.addEventListener(
			"icecandidate",
			(e: RTCPeerConnectionIceEvent) => {
				//console.log("userId:", this.userId, "onicecandidate triggered");
				if (e.candidate) {
					/*
					console.log(
						"userId:",
						this.userId,
						"sending ice candidate"
					);
                    */
					this.socket.emit(SocketEmits.EMIT_CANDIDATE, {
						candidate: e.candidate,
					});
				}
			}
		);
		/*
		this.peerConnection.onnegotiationneeded = async () => {
			console.log("userId:", this.userId, `onnegotiation is triggered`);
			this.makingOffer = false;
			try {
				this.makingOffer = true;
				console.log(
					"userId:",
					this.userId,
					`onnegotiation - setting localDescription`
				);
				const offer = await this.peerConnection.createOffer();
				await this.peerConnection.setLocalDescription(offer);
				const data: SendDesc = {
					description: this.peerConnection.localDescription,
				};
				console.log(
					"userId:",
					this.userId,
					`onnegotiation - sending localDesc`
				);
				this.socket.emit(SocketEmits.EMIT_DESC, data);
			} catch (err) {
				console.error(err);
			} finally {
				this.makingOffer = false;
			}
		};
        */
		this.peerConnection.oniceconnectionstatechange = () => {
			if (this.peerConnection.iceConnectionState === "failed") {
				this.peerConnection.restartIce();
			}
		};
	}
	socketConnect = async () => {
		const COOKIE_NAME = "sid";
		this.socket = io(consts.SOCKET_URL, {
			withCredentials: true,
			auth: {
				authCookie: this.cookie,
			},
		});
		this.socket.on(
			SocketEmits.CREATED_ROOM,
			async (data: JoinedRoomReq) => {
				//@ts-ignore
				await this.createOffer(data.isPolite);
			}
		);

		/*
		this.socket.on(
			SocketEmits.CREATED_ROOM,
			async (data: JoinedRoomReq) => {
				this.polite = data.isPolite;
				//@ts-ignore
				console.log(
					"userId:",
					this.userId,
					`SocketEmits.CREATED_ROOM - adding new track`
				);
				console.log(
					"userId:",
					this.userId,
					`SocketEmits.CREATED_ROOM - signalingState: ${this.peerConnection.signalingState}`
				);
				const dummyTransceiver =
					this.peerConnection.addTransceiver("audio");
				dummyTransceiver.direction = "sendrecv";
				//await this.createDesc();
			}
		);
        */

		this.socket.on(SocketEmits.ASK_POLITENESS, async () => {
			this.socket.emit(SocketEmits.ASK_POLITENESS, {
				myPolite: this.polite,
			});
		});

		this.socket.on(SocketEmits.REJOIN_ROOM, async (data: JoinedRoomReq) => {
			//@ts-ignore
			//this.createOffer(data.isPolite);
			const dummyTransceiver =
				this.peerConnection.addTransceiver("audio");
			dummyTransceiver.direction = "sendrecv";
		});

		/*
		this.socket.on(SocketEmits.EMIT_DESC, async (data: SendDesc) => {
			this.handleSendDesc(data.description);
		});
        */
		this.socket.on(
			SocketEmits.EMIT_CANDIDATE,
			async (data: CandidateFoundReq) => {
				this.handleIceCandidate(data.candidate);
			}
		);
		this.socket.on(SocketEmits.EMIT_OFFER, async (data: SendOfferReq) => {
			this.acceptOffer(data.offer);
		});
		this.socket.on(SocketEmits.EMIT_ANSWER, async (data: SendAnswerReq) => {
			this.acceptAnswer(data.answer);
		});
	};
	createDesc = async () => {
		console.log("userId:", this.userId, `onnegotiation is triggered`);
		this.makingOffer = false;
		if (this.userId == "user1") {
			return;
		}
		try {
			this.makingOffer = true;
			console.log(
				"userId:",
				this.userId,
				`onnegotiation - setting localDescription`
			);
			const offer = await this.peerConnection.createOffer();
			await this.peerConnection.setLocalDescription(offer);
			const data: SendDesc = {
				description: this.peerConnection.localDescription,
			};
			//this.socket.emit(SocketEmits.EMIT_DESC, data);
		} catch (err) {
			console.error(err);
		} finally {
			this.makingOffer = false;
		}
	};
	handleSendDesc = async (description: RTCSessionDescriptionInit) => {
		console.log("userId:", this.userId, "handleSendDesc is triggered");
		const offerCollision =
			description.type === "offer" &&
			(this.makingOffer ||
				this.peerConnection.signalingState !== "stable");

		const ignoreOffer = !this.polite && offerCollision;
		console.log(
			"userId:",
			this.userId,
			`handleCollision - offerCollision ${offerCollision} - ignoreOffer ${ignoreOffer} - polite ${this.polite}`
		);
		if (ignoreOffer) {
			return;
		}

		if (description.type === "offer") {
			console.log(
				"userId:",
				this.userId,
				`handleSendDesc - polite: ${this.polite} - setting localDescription`
			);
			if (this.peerConnection.localDescription) {
				await this.peerConnection.setLocalDescription({
					type: "rollback",
				});
				const answer = await this.peerConnection.createAnswer();
				await this.peerConnection.setLocalDescription(answer);
				const sendBackData: SendDesc = {
					description: this.peerConnection.localDescription,
				};
				console.log(
					"userId:",
					this.userId,
					`handleSendDesc - sending answer${answer}`
				);
				this.socket.emit(SocketEmits.EMIT_DESC, sendBackData);
			}
		} else if (description.type === "answer") {
			console.log(
				"userId:",
				this.userId,
				`handleSendDesc - before set remoteDescrition`
			);
			await this.peerConnection.setRemoteDescription(description);
			console.log(
				"userId:",
				this.userId,
				`handleSendDesc - after set remoteDescrition`
			);
		}
	};
	handleIceCandidate = async (candidate: RTCIceCandidate) => {
		//console.log("userId:", this.userId, "handleIceCandidate triggered");
		if (this.peerConnection) {
			/*
			console.log(
				"userId:",
				this.userId,
				"handleIceCandidate adding ice candidate"
			);
            */
			this.peerConnection.addIceCandidate(candidate);
		}
	};
	acceptAnswer = async (answer: RTCSessionDescriptionInit) => {
		console.log("userId:", this.userId, "acceptAnswer triggered");
		if (!this.peerConnection.currentRemoteDescription) {
			console.log(
				"userId:",
				this.userId,
				"accepting answer and setRemoteDescription(answer)"
			);
			this.peerConnection.setRemoteDescription(answer);
			this.makingOffer = false;
		}
	};
	createOffer = async (isPolite) => {
		console.log("userId:", this.userId, "createOffer triggered");
		if (isPolite) {
			console.log("userId:", this.userId, "creating offer and localDesc");
			this.makingOffer = true;
			const offer = await this.peerConnection.createOffer({
				offerToReceiveAudio: true,
			});
			await this.peerConnection.setLocalDescription(offer);
			const data: SendOfferReq = {
				//@ts-ignore
				offer: this.peerConnection.localDescription,
			};
			this.socket.emit(SocketEmits.EMIT_OFFER, data);
		}
	};

	acceptOffer = async (offer: RTCSessionDescriptionInit) => {
		console.log("userId:", this.userId, "acceptOffer triggered");
		await this.peerConnection.setRemoteDescription(offer);
		console.log("userId:", this.userId, "accepting offer");
		let answer = await this.peerConnection.createAnswer();
		await this.peerConnection.setLocalDescription(answer);

		let data: SendAnswerReq = {
			//@ts-ignore
			answer: this.peerConnection.localDescription,
		};
		this.socket.emit(SocketEmits.EMIT_ANSWER, data);
	};
	waitForRoom = async () => {
		const data: JoinRoomReq = {
			userId: this.userId,
			offering: this.seeking,
			seeking: this.offering,
		};
		this.socket.emit(SocketEmits.WAIT_FOR_ROOM, data);
	};
	disconnect() {
		if (this.socket) {
			this.socket.close();
		}
		if (this.peerConnection) {
			this.peerConnection.close();
		}
	}
	leaveRoom() {
		this.disconnect();
	}
}
