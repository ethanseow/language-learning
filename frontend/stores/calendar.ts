import { defineStore } from "pinia";
import { type Time } from "@/utils/time";
export const useCalendarStore = defineStore("calendarStore", () => {
	const exampleTimes = generateTimes(24, 30);
	const availableTimes = ref(exampleTimes);
	const setTimes = (times: Time[]) => {
		availableTimes.value = times;
	};
	return { availableTimes, setTimes };
});
