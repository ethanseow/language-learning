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
import { Feedback, searchRating, type User } from "~~/utils/firebase";
import { createSession } from "~~/utils/firebase";
import _ from "lodash";
export interface Session {
	languageOffering: string;
	languageSeeking: string;
	appointmentDate: Date;
	peerName: string | null;
	id: string;
	readonly userId: string;
}

export const useSessionStore = defineStore("sessionStore", () => {
	let pastSessions: Ref<Session[]> = useState("pastSessions", () => [
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
	let upcomingSessions: Ref<Session[]> = useState("upcomingSessions", () => [
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
	let feedback: Ref<Record<string, Feedback>> = ref({});
	const addUpcomingSessions = async (newSession: Session) => {
		const doc = await createSession(newSession);
		if (doc) {
			setUpcomingSessions([...upcomingSessions.value, newSession]);
		}
	};
	const retrieveAllFeedback = async (sessions: Session[]) => {
		const a = await Promise.all(
			sessions.map(async (s) => {
				console.log("retrieveAllFeedback - sessionId", s.id);
				const a = await searchRating(s.id);
				return a;
			})
		);
		const copy = { ...feedback.value };
		a.forEach((s) => {
			if (s?.sessionId) {
				const sid = s.sessionId;
				copy[sid] = s;
			}
		});
		feedback.value = copy;
	};
	const setUpcomingSessions = (sessions: Session[]) => {
		upcomingSessions.value = _.cloneDeep(sessions);
	};
	const setPastSessions = (sessions: Session[]) => {
		pastSessions.value = _.cloneDeep(sessions);
	};
	const retrieveAllSessions = async (user: User) => {
		const nuxtApp = useNuxtApp();
		const upcomingSessions = await getSessions(
			nuxtApp.$firestore,
			false,
			user.uid
		);
		const pastSessions = await getSessions(
			nuxtApp.$firestore,
			true,
			user.uid
		);
		setPastSessions(pastSessions);
		setUpcomingSessions(upcomingSessions);
	};
	// clear all sessions from store

	// need to think about this - cannot have it check every single time when user changes
	return {
		feedback,
		pastSessions,
		upcomingSessions,
		addUpcomingSessions,
		setUpcomingSessions,
		setPastSessions,
		retrieveAllSessions,
		retrieveAllFeedback,
	};
});
