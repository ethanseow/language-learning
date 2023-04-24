import * as dotenv from "dotenv";
dotenv.config({ path: "./.env" });
const firebaseConfig = {
	apiKey: process.env.NUXT_PUBLIC_API_KEY,
	authDomain: process.env.NUXT_PUBLIC_AUTH_DOMAIN,
	projectId: process.env.NUXT_PUBLIC_PROJECT_ID,
	storageBucket: process.env.NUXT_PUBLIC_STORAGE_BUCKET,
	appId: process.env.NUXT_PUBLIC_APP_ID,
	messagingSenderId: process.env.NUXT_PUBLIC_MESSAGING_SENDER_ID,
	measurementId: process.env.NUXT_PUBLIC_MEASUREMENT_ID,
};
console.log(firebaseConfig);
