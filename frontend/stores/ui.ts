import { defineStore } from "pinia";
export const useCalenderUIStore = defineStore("calendarUIStore", () => {
	const showCalendar = ref(false);
	const setCalendar = (bool: boolean) => {
		console.log(`setting calendar to ${bool}`);
		showCalendar.value = bool;
	};
	return { showCalendar, setCalendar };
});
