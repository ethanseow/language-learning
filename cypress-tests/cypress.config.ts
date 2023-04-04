import { defineConfig } from "cypress";
import { io } from "socket.io-client";
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
// import { RTCMocker } from "./RTCMocker";
export default defineConfig({
	e2e: {
		setupNodeEvents(on, config) {
			// let mocker = new RTCMocker();
			let socket = io(consts.SOCKET_API_BASE, {
				withCredentials: true,
			});
			let peerConnection: RTCPeerConnection = new wrtc.RTCPeerConnection(
				servers
			);

			socket.on(SocketEmits.JOIN_ROOM, async (data: JoinedRoomReq) => {});
			/*
			socket.on(SocketEmits.JOIN_ROOM, async (data: JoinedRoomReq) => {
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
			socket.on(SocketEmits.EMIT_CANDIDATE, (data: CandidateFoundReq) => {
				console.log("Got ice candidate");
				if (peerConnection.value) {
					console.log("Adding ice candidate");
					peerConnection.value.addIceCandidate(data.candidate);
				}
			});
			socket.on(SocketEmits.EMIT_OFFER, async (data: SendOfferReq) => {
				console.log("Accepting offer");
				acceptOffer(data.offer);
			});
			socket.on(SocketEmits.EMIT_ANSWER, async (data: SendAnswerReq) => {
				console.log("Accepting answer");
				acceptAnswer(data.answer);
			});
			socket.on(SocketEmits.PARTNER_DISCONNECTED, () => {
				stopConnection();
			});
			socket.on(SocketEmits.SEND_MESSAGE, (message: Message) => {
				console.log("Previous allMessage", allMessages.value);
				allMessages.value.push(message);
				console.log("Appended allMessage", allMessages.value);
			});
            */
			on("task", {
				checkPeerConnection() {
					return "" + peerConnection.connectionState;
				},
				connectToPeer() {
					const data = {
						userId: "" + Math.random() * 100000,
						offering: consts.LANGUAGE_OFFERING,
						seeking: consts.LANGUAGE_SEEKING,
					};
					socket.emit(SocketEmits.WAIT_FOR_ROOM, data);
					return null;
				},
				changeData(data) {
					test.setDataToBeRead(data);
					return null;
				},
				readData() {
					return test.readDataToBeRead();
				},
			});
		},
	},
});
