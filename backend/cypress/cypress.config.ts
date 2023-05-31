import { defineConfig } from "cypress";
import * as dotenv from "dotenv";
import room from "@/redis/room";
import pool from "@/redis/pool";
import { RTCMocker } from "../test/RTCMocker";
import consts from "./consts";
export default defineConfig({
	env: {
		apiKey: process.env.NUXT_PUBLIC_API_KEY,
		authDomain: process.env.NUXT_PUBLIC_AUTH_DOMAIN,
		projectId: process.env.NUXT_PUBLIC_PROJECT_ID,
		storageBucket: process.env.NUXT_PUBLIC_STORAGE_BUCKET,
		appId: process.env.NUXT_PUBLIC_APP_ID,
		messagingSenderId: process.env.NUXT_PUBLIC_MESSAGING_SENDER_ID,
		measurementId: process.env.NUXT_PUBLIC_MEASUREMENT_ID,
		browserPermissions: {
			notifications: "allow",
			geolocation: "allow",
			camera: "allow",
			microphone: "allow",
			images: "allow",
			javascript: "allow",
			popups: "ask",
			plugins: "ask",
			cookies: "allow",
		},
	},
	e2e: {
		setupNodeEvents(on, config) {
			const offering = consts.OFFERING;
			const seeking = consts.SEEKING;
			const userId1 = consts.USERID1;
			// usually you need to set this
			const userCookie = "cookie1";
			const mocker1 = new RTCMocker(offering, seeking, userId1);
			on("task", {
				clearRoom() {
					room.clearAll();
					return null;
				},
				clearPool() {
					pool.clearAll();
					return null;
				},
				rtcConnect() {
					mocker1.rtcConnect();
					return null;
				},
				socketConnect() {
					mocker1.socketConnect();
					return null;
				},
				waitForRoom() {
					mocker1.waitForRoom();
					return null;
				},
				rtcSendMessage(message) {
					mocker1.rtcSendMessage(message);
					return null;
				},
				isFullyConnected() {
					return mocker1.isFullyConnected();
				},
				disconnect() {
					mocker1.disconnect();
					return null;
				},
				getMockerMessages() {
					return mocker1.messages;
				},
				log(message) {
					console.log(message);
					return null;
				},
			});
		},
	},
});
