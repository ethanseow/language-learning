import { DocumentData, DocumentReference } from "firebase/firestore";
import { defineStore } from "pinia";
import { Ref } from "vue";
import { Session } from "./sessions";
export const useRatingStore = defineStore("ratingStore", () => {
	const session = ref();
	const meetingId = ref();
	const doc = ref();
	const setMeetingId = (id: string) => {
		meetingId.value = id;
	};
	const setDoc = (d: DocumentReference<DocumentData>) => {
		doc.value = d;
	};
	const setSession = (s: Session) => {
		session.value = s;
	};
	return {
		meetingId,
		setMeetingId,
		doc,
		setDoc,
		session,
		setSessionId: setSession,
	};
});
