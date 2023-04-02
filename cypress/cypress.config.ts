import { defineConfig } from "cypress";
import { io } from "../node_modules/socket.io-client/build/esm/index";
import { SocketEmits } from "../frontend/backend-api/sockets";
import consts from "./consts";
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

export default defineConfig({
	// setupNodeEvents can be defined in either
	// the e2e or component configuration
	e2e: {
		setupNodeEvents(on, config) {
			const apiBase = "http://localhost:4000";
			let socket = io(apiBase, {});

			/*
                fix cypress.config.ts to work with ts
                then try to test out the "this" key word thing
                if not, then look into how we can use "state"
                in our application - can two files share the same
                node file and access and change each other's 
                state?
            */
			/*
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
					const data = {
						userId: "testing",
						offering: consts.LANGUAGE_SEEKING,
						seeking: consts.LANGUAGE_SEEKING,
					};
					//this.lastMessage = "hello world";
					socket.emit(SocketEmits.WAIT_FOR_ROOM, data);
					return null;
				},
				getApiBase() {
					return apiBase;
				},
			});
		},
	},
});
