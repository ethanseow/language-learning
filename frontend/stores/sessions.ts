import { defineStore } from "pinia";
import { type Ref } from "vue";
import { type Time } from "@/utils/time";
import {
	Firestore,
	Timestamp,
	collection,
	getDocs,
	query,
	where,
} from "firebase/firestore";
import { Auth } from "firebase/auth";
import { getSessions } from "~~/firebase/utils";
export interface Session {
	languageOffering: string;
	languageSeeking: string;
	appointmentDate: Date;
	peerName: string | null;
	readonly userId: string;
}

export const useSessionStore = defineStore("sessionStore", () => {
	let pastSessions: Ref<Session[]> = ref([
		/*
		{
			languageOffering: "Mandarin",
			languageSeeking: "English",
			appointmentDate: new Date(2023, 1, 14, 10, 15),
			peerName: "Bobby Schmurdah",
			userId: "this is my userid",
		},
        */
	]);
	let upcomingSessions: Ref<Session[]> = ref([
		/*
		{
			languageOffering: "Mandarin",
			languageSeeking: "English",
			appointmentDate: new Date(2023, 1, 18, 9, 0),
			peerName: null,
			userId: "this is my userid",
		},
        */
	]);
	const addUpcomingSessions = (newSession: Session) => {
		upcomingSessions.value.push(newSession);
	};
	const fbAuth = useAuthState();
	// need to think about this - cannot have it check every single time when user changes
	watch(fbAuth.currentUser, async () => {
		upcomingSessions.value = await getSessions(
			false,
			// @ts-ignore
			fbAuth.auth.currentUser?.uid
		);
		pastSessions.value = await getSessions(
			true,
			// @ts-ignore
			fbAuth.auth.currentUser?.uid
		);
	});
	return { pastSessions, upcomingSessions, addUpcomingSessions };
});
