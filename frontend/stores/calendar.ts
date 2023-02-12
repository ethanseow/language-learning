import { defineStore } from "pinia";
export const useCalendarStore = defineStore("calendarStore", () => {
	const account = ref({
		firstName: "Bob",
		lastName: "jones",
		email: "abc123@gmail.com",
		interviewsLeft: 5,
	});
	return { account };
});
