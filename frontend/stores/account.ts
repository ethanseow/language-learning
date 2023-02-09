import { defineStore } from "pinia";
export const useAccountStore = defineStore("accountStore", () => {
	const account = ref({
		firstName: "Bob",
		lastName: "jones",
		email: "abc123@gmail.com",
		interviewsLeft: 5,
	});
	return { account };
});
