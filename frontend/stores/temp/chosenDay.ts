import { defineStore } from "pinia";
export const useChosenDay = defineStore("tempChosenDay", () => {
	const chosenDay = ref();
	const setChosenDay = (date: Date) => {
		chosenDay.value = new Date(date);
	};
	return {
		chosenDay,
		setChosenDay,
	};
});
