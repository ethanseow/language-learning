import { defineConfig } from "cypress";
// import { io } from "socket.io-client";
//import { SocketEmits } from "../frontend/backend-api/sockets";
/*
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
*/
export default defineConfig({
	e2e: {
		setupNodeEvents(on, config) {
			const constants = require("./consts");
			const io = require("socket.io-client");
			const SocketEmits = require("../frontend/backend-api/sockets");
			let socket;
			on("task", {
				connectToPeer() {
					const data = {
						userId: "" + Math.random() * 100000,
						offering: constants.LANGUAGE_OFFERING,
						seeking: constants.LANGUAGE_SEEKING,
					};
					socket = io(constants.API_BASE, {
						withCredentials: true,
					});
					socket.emit(SocketEmits.WAIT_FOR_ROOM, data);
					return null;
				},
			});
		},
	},
});
