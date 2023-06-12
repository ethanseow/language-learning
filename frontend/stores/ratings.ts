import { DocumentData, DocumentReference } from "firebase/firestore";
import { defineStore } from "pinia";
import { Ref } from "vue";
export const useRatingStore = defineStore("ratingStore", () => {
	const sessionId = ref();
	const meetingId = ref();
	const doc = ref();
	const setMeetingId = (id: string) => {
		meetingId.value = id;
	};
	const setDoc = (d: DocumentReference<DocumentData>) => {
		doc.value = d;
	};
	const setSessionId = (sid: string) => {
		sessionId.value = sid;
		console.log("setSessionId", sessionId.value);
	};
	return {
		meetingId,
		setMeetingId,
		doc,
		setDoc,
		sessionId,
		setSessionId,
	};
});
