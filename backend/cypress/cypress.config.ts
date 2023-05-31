import { defineConfig } from "cypress";
import * as dotenv from "dotenv";
import room from "@/redis/room";
import pool from "@/redis/pool";
import { RTCMocker } from "../test/RTCMocker";
import consts from "./consts";
import { POOL_COMMANDS_ENUM, ROOM_COMMANDS_ENUM as r } from "./consts";
import { Room } from "@/redis/RoomSingleton";
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

	defaultCommandTimeout: 120000,
	e2e: {
		setupNodeEvents(on, config) {
			const offering = consts.OFFERING;
			const seeking = consts.SEEKING;
			const userId1 = consts.MOCKER_USERID1;
			// usually you need to set this
			const userCookie = "cookie1";
			const mocker1 = new RTCMocker(offering, seeking, userId1);
			const roomCommands = {
				clearRoom() {
					room.clearAll();
					return null;
				},

				async findRoomForUser(userId: string) {
					const r = await room.findRoomForUser(userId);
					if (r == undefined) {
						return null;
					}
					return r;
				},
				async findUsersForRoom(r: Room) {
					const u = await room.findUsersForRoom(r);
					return u;
				},
			};
			const poolCommands = {
				clearPool() {
					pool.clearAll();
					return null;
				},
				findUserInPool(userId: string) {
					return pool.findUserInPool(userId);
				},
			};
			const rtcMockerCommands = {
				getMockerUserId() {
					return mocker1.userId;
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
				rtcConnect() {
					mocker1.rtcConnect();
					return null;
				},
			};
			on("task", {
				...roomCommands,
				...rtcMockerCommands,
				...poolCommands,
				log(message) {
					console.log(message);
					return null;
				},
			});
		},
	},
});
