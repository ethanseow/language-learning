import { defineStore } from "pinia";
import { type Ref } from "vue";
import { type Time } from "@/utils/time";
export interface Session {
	languageOffering: string;
	languageSeeking: string;
	appointmentDate: Date;
	peerName: string | null;
}
export const useSessionStore = defineStore("sessionStore", () => {
	let pastSessions: Ref<Session[]> = ref([
		{
			languageOffering: "Mandarin",
			languageSeeking: "English",
			appointmentDate: new Date(2023, 1, 14, 10, 15),
			peerName: "Bobby Schmurdah",
		},
	]);
	let upcomingSessions: Ref<Session[]> = ref([
		{
			languageOffering: "Mandarin",
			languageSeeking: "English",
			appointmentDate: new Date(2023, 1, 18, 9, 0),
			peerName: null,
		},
	]);
	const addUpcomingSessions = (newSession: Session) => {
		upcomingSessions.value.push(newSession);
	};
	return { pastSessions, upcomingSessions, addUpcomingSessions };
});
