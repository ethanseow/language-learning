import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
//const config = useRuntimeConfig();
//console.log(config.public.apiKey);
//console.log(config.public.apiBase);

const firebaseConfig = {
	apiKey: process.env.NUXT_PUBLIC_API_KEY,
	authDomain: process.env.NUXT_PUBLIC_AUTH_DOMAIN,
	projectId: process.env.NUXT_PUBLIC_PROJECT_ID,
	storageBucket: process.env.NUXT_PUBLIC_STORAGE_BUCKET,
	messagingSenderId: process.env.NUXT_PUBLIC_MESSAGING_SENDER_ID,
	appId: process.env.NUXT_PUBLIC_APP_ID,
	measurementId: process.env.NUXT_PUBLIC_MEASUREMENT_ID,
};
const app = initializeApp(firebaseConfig);
export const useFirebase = () => {
	const $auth = getAuth(app);
	const $firestore = getFirestore(app);

	return {
		$auth,
		$firestore,
	};
};
