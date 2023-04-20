import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export default defineNuxtPlugin((nuxtApp) => {
	const config = useRuntimeConfig();
	console.log(config.public.apiKey);
	console.log(config.public.apiBase);

	const firebaseConfig = {
		apiKey: config.apiKey,
		authDomain: config.authDomain,
		projectId: config.projectId,
		storageBucket: config.storageBucket,
		messagingSenderId: config.messagingSenderId,
		appId: config.appId,
		measurementId: config.measurementId,
	};

	const app = initializeApp(firebaseConfig);
	const auth = getAuth(app);
	const firestore = getFirestore(app);

	nuxtApp.vueApp.provide("auth", auth);
	nuxtApp.provide("auth", auth);

	nuxtApp.vueApp.provide("firestore", firestore);
	nuxtApp.provide("firestore", firestore);

	nuxtApp.vueApp.provide("provided", "hello world");
	nuxtApp.provide("provided", "hello world");
});
