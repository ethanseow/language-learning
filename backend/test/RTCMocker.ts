import { Socket, io } from "socket.io-client";
import { SocketEmits } from "../../frontend/backend-api/sockets";
import * as wrtc from "wrtc";
import { workerData, parentPort, isMainThread } from "worker_threads";
import { parse } from "cookie";
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
	}
	setRTCConnectionState(state: string) {
		this.RTCConnectionState = state;
	}
	setRTCSignalingState(state: string) {
		this.RTCSignalingState = state;
	}
	rtcConnect() {
		this.peerConnection = new wrtc.RTCPeerConnection(servers);
		this.peerConnection.onsignalingstatechange = (e) => {
			switch (this.peerConnection.signalingState) {
				case "stable":
					this.setRTCSignalingState("stable");
					break;
				default:
					break;
			}
		};
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
		this.peerConnection.oniceconnectionstatechange = () => {
			if (this.peerConnection.iceConnectionState === "failed") {
				this.peerConnection.restartIce();
			}
		};
	}
	connect = async () => {
		const COOKIE_NAME = "sid";
		this.socket = io(consts.SOCKET_URL, {
			withCredentials: true,
			auth: {
				authCookie: this.cookie,
			},
		});
		/*
		this.socket.io.on("open", () => {
			this.socket.io.engine.transport.on("pollComplete", () => {
				//@ts-ignore
				const request = this.socket.io.engine.transport.pollXhr.xhr;
				const cookieHeader = request.getResponseHeader("set-cookie");
				if (!cookieHeader) {
					return;
				}
				cookieHeader.forEach((cookieString) => {
					console.log("string", cookieString);
					if (cookieString.includes(`${COOKIE_NAME}=`)) {
						const cookie = parse(cookieString);
						this.socket.io.opts.extraHeaders = {
							cookie: `${COOKIE_NAME}=${cookie[COOKIE_NAME]}`,
						};
					}
				});
			});
		});
        */

		this.makingOffer = false;
		this.socket.on(
			SocketEmits.CREATED_ROOM,
			async (data: JoinedRoomReq) => {
				//@ts-ignore
				this.rtcConnect();
				function delay(timeout) {
					return new Promise((resolve) => {
						setTimeout(resolve, timeout);
					});
				}
				// console.log("before delay");
				// await delay(1000);
				// console.log("after delay");
				// await delay(1000);
				await this.createOffer(data.isPolite);
			}
		);

		this.socket.on(SocketEmits.ASK_POLITENESS, async () => {
			this.socket.emit(SocketEmits.ASK_POLITENESS, {
				myPolite: this.polite,
			});
		});

		this.socket.on(SocketEmits.REJOIN_ROOM, async (data: JoinedRoomReq) => {
			//@ts-ignore
			this.createOffer(data.isPolite);
		});
		this.socket.on(SocketEmits.EMIT_CANDIDATE, this.handleIceCandidate);
		this.socket.on(SocketEmits.EMIT_OFFER, async (data: SendOfferReq) => {
			this.acceptOffer(data.offer);
		});
		this.socket.on(SocketEmits.EMIT_ANSWER, async (data: SendAnswerReq) => {
			console.log("Accepting answer");
			this.acceptAnswer(data.answer);
		});
	};
	handleIceCandidate = async (data: CandidateFoundReq) => {
		console.log("Got ice candidate");
		if (this.peerConnection) {
			console.log("Adding ice candidate");
			this.peerConnection.addIceCandidate(data.candidate);
		}
	};
	acceptAnswer = async (answer: RTCSessionDescriptionInit) => {
		if (!this.peerConnection.currentRemoteDescription) {
			console.log("accepted answer");
			this.peerConnection.setRemoteDescription(answer);
			this.makingOffer = false;
			parentPort.postMessage({ completed: true });
		}
	};
	createOffer = async (isPolite) => {
		console.log("before set local description");
		this.polite = isPolite;
		this.makingOffer = true;
		const offer = await this.peerConnection.createOffer();
		await this.peerConnection.setLocalDescription(offer);
		const data: SendOfferReq = {
			//@ts-ignore
			offer: this.peerConnection.localDescription,
		};
		console.log("user", this.userId, "is creating offer");
		this.socket.emit(SocketEmits.EMIT_OFFER, data);
		console.log("done creating offer");
	};

	acceptOffer = async (offer: RTCSessionDescriptionInit) => {
		console.log("received an offer");
		const offeringRightNow =
			this.peerConnection.signalingState !== "stable" && this.makingOffer;
		const denyOffer = this.polite == false && offeringRightNow;
		console.log("denyOffer", denyOffer);
		console.log("offeringRightNow", offeringRightNow);
		if (denyOffer) {
			console.log("Denied Offer");
			return;
		}
		console.log("Accepted Offer");
		this.makingOffer = false;
		console.log("at accept offer function");
		await this.peerConnection.setRemoteDescription(offer);

		let answer = await this.peerConnection.createAnswer();
		await this.peerConnection.setLocalDescription(answer);
		console.log("setting answer local description");

		let data: SendAnswerReq = {
			//@ts-ignore
			answer: this.peerConnection.localDescription,
		};
		console.log("emitting answer");
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
}

/*
if (!isMainThread) {
	const offering: string = workerData.offering;
	const seeking: string = workerData.seeking;
	const userId: string = workerData.userId;

	const mocker = new RTCMocker(offering, seeking, userId);

	console.log("running worker");
	mocker.connect();
	mocker.waitForRoom();
	console.log("after waiting room worker");
}
*/
