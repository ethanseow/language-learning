import { Socket, io } from "socket.io-client";
import { Ref } from "vue";
import { SocketEmits } from "@/constants/sockets";
import {
	type JoinRoomReq,
	type JoinedRoomReq,
	type PartnerJoinedReq,
	type CandidateFoundReq,
	type SendOfferReq,
	type SendAnswerReq,
} from "@/constants/sockets";
import { urlConsts as consts } from "@/constants/urlConsts";
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

export type Message = {
	message: string;
	isMine: boolean;
};

export class RTCMocker {
	//@ts-ignore
	socket: Socket;
	//@ts-ignore
	peerConnection: RTCPeerConnection;
	//@ts-ignore
	rtcMessageChannel: RTCDataChannel;
	messages: Ref<Message[]>;
	userId: string;
	offering: string;
	seeking: string;
	partnerId: string | null | undefined;
	RTCSignalingState: string | undefined;
	RTCConnectionState: string | undefined;
	constructor(offering: string, seeking: string, userId: string) {
		this.userId = userId;
		this.offering = offering;
		this.seeking = seeking;
		this.messages = ref([]);
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
	rtcSendMessage(message: string) {
		const msg = { isMine: true, message };
		if (this.rtcMessageChannel) {
			this.rtcMessageChannel.send(message);
		}
		this.messages.value = [...this.messages.value, msg];
	}
	rtcMessageChannelInit() {
		console.log("rtcMessageChannel initialized - I am", this.userId);
		if (this.rtcMessageChannel) {
			console.log("rtcMessageChannel.onMessage frontend initialized");
			this.rtcMessageChannel.onmessage = (e: MessageEvent) => {
				console.log("rtcMessageChannel.onMessage frontend triggered");
				console.log(
					"rtcMessageChannel.onMessage - received message from",
					e.origin
				);
				this.messages.value = [
					...this.messages.value,
					{ isMine: false, message: e.data },
				];
			};
		}
	}
	rtcConnect() {
		this.peerConnection = new RTCPeerConnection(servers);
		this.peerConnection.onsignalingstatechange = (e) => {
			switch (this.peerConnection.signalingState) {
				case "have-remote-offer":
					this.setRTCSignalingState("have-remote-offer");
					break;
				case "have-local-offer":
					this.setRTCSignalingState("have-local-offer");
					break;
				case "closed":
					this.setRTCSignalingState("closed");
					break;
				case "have-local-pranswer":
					this.setRTCSignalingState("have-local-pranswer");
					break;
				case "have-remote-pranswer":
					this.setRTCSignalingState("have-remote-pranswer");
					break;
				case "stable":
					this.setRTCSignalingState("stable");
					break;
				default:
					break;
			}
		};
		this.peerConnection.ontrack = (e) => {};
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
		this.peerConnection.oniceconnectionstatechange = () => {
			if (this.peerConnection.iceConnectionState === "failed") {
				this.peerConnection.restartIce();
			}
		};
		this.peerConnection.ondatachannel = (e) => {
			console.log("peerConnection.ondatachannel - I am", this.userId);
			this.rtcMessageChannel = e.channel;
			this.rtcMessageChannelInit();
		};
	}

	socketConnect = async () => {
		const COOKIE_NAME = "sid";
		this.socket = io(consts.SOCKET_URL, {
			withCredentials: true,
			auth: {
				userId: this.userId,
			},
		});
		this.socket.connect();

		this.socket.on(
			SocketEmits.CREATED_ROOM,
			async (data: JoinedRoomReq) => {
				await this.createOffer(data.isPolite);
			}
		);

		this.socket.on(SocketEmits.REJOIN_ROOM, async (data: JoinedRoomReq) => {
			await this.rejoinRoom(data.isPolite);
		});

		this.socket.on(SocketEmits.PARTNER_DISCONNECTED, async () => {
			this.peerConnection.restartIce();
		});

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
		this.socket.on(SocketEmits.END_MEETING, () => {
			this.disconnect();
		});
	};

	rejoinRoom = async (isPolite: boolean) => {
		this.peerConnection.restartIce();
		console.log(
			"rejoinRoom - userId",
			this.userId,
			"signalingState",
			this.peerConnection.signalingState
		);
		await this.createOffer(isPolite);
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
		}
	};
	createOffer = async (isPolite: boolean) => {
		console.log("userId:", this.userId, "createOffer triggered");
		if (isPolite) {
			console.log("userId:", this.userId, "creating offer and localDesc");
			this.rtcMessageChannel =
				this.peerConnection.createDataChannel("messaging-channel");
			this.rtcMessageChannelInit();
			const offer = await this.peerConnection.createOffer({
				offerToReceiveAudio: true,
				offerToReceiveVideo: true,
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
		console.log("userId:", this.userId, "after create answer");
		await this.peerConnection.setLocalDescription(answer);

		let data: SendAnswerReq = {
			//@ts-ignore
			answer: this.peerConnection.localDescription,
		};
		this.socket.emit(SocketEmits.EMIT_ANSWER, data);
	};
	isFullyConnected() {
		return (
			this.peerConnection?.connectionState == "connected" &&
			this.peerConnection?.signalingState == "stable"
		);
	}
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
			this.socket.disconnect();
		}
		if (this.peerConnection) {
			this.rtcMessageChannel.close();
			this.peerConnection.close();
			this.peerConnection.restartIce();
			console.log(
				"disconnect - signalingState",
				this.peerConnection.signalingState
			);
		}
		this.messages.value = [];
	}
}
