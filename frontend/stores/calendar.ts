import { defineStore } from "pinia";
import { type Time } from "@/utils/time";
import { Ref } from "vue";
export const useCalendarStore = defineStore("calendarStore", () => {
	const userId: Ref<number | undefined> = ref();
	const exampleTimes = generateTimes(24, 30);
	const availableTimes = ref(exampleTimes);
	const setTimes = (times: Time[]) => {
		availableTimes.value = times;
	};
	// atomic operation - only allow for system, never expose to user
	const setUserId = (newUserId: number) => {
		userId.value = newUserId;
	};
	return { availableTimes, setTimes };
});
