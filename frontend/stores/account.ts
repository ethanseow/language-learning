import { defineStore } from "pinia";
import { Ref } from "vue";
export const useAccountStore = defineStore("accountStore", () => {
	const account = ref({
		firstName: "Bob",
		lastName: "jones",
		email: "abc123@gmail.com",
		interviewsLeft: 5,
		userId: undefined,
	});
	// atomic operation - only allow for system, never expose to user
	const setUserId = (newUserId: string) => {
		account.value.userId = newUserId;
	};
	return { account, setUserId };
});
