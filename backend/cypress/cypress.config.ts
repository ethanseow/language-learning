import { defineConfig } from "cypress";
import * as dotenv from "dotenv";
import room from "@/redis/room";
import pool from "@/redis/pool";
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
			on("task", {
				clearRoom() {
					room.clearAll();
					return null;
				},
				clearPool() {
					pool.clearAll();
					return null;
				},
				log(message) {
					console.log(message);
					return null;
				},
			});
		},
	},
});
