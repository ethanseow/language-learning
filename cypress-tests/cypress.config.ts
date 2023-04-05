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
import { RTCMocker } from "./RTCMocker";
export default defineConfig({
	e2e: {
		setupNodeEvents(on, config) {
			let mocker = new RTCMocker();
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
				connectToPeer() {
					mocker.waitForRoom();
					return null;
				},
				checkConnectionStatus() {
					return mocker.peerConnection.iceConnectionState;
				},
				/*
				checkPeerConnection() {
					return "" + peerConnection.connectionState;
				},
				changeData(data) {
					test.setDataToBeRead(data);
					return null;
				},
				readData() {
					return test.readDataToBeRead();
				},
                */
			});
		},
	},
});
