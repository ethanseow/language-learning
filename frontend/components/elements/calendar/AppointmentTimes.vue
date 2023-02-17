<template>
	<div
		class="w-full flex flex-col justify-center items-center text-white h-full gap-5"
	>
		<div>{{ chosenDayString }}</div>
		<div class="overflow-y-auto w-full flex flex-col items-center">
			<div
				v-for="(time, index) in times"
				class="text-center border-backgroundSecondary border-2 mb-2 rounded-md w-1/2"
			>
				<div
					v-if="buttonSelection != index"
					class="p-4"
					@click="makeSelection(index)"
				>
					{{ time }}
				</div>
				<div
					v-if="buttonSelection == index"
					class="bg-white text-black h-full w-full p-4"
					@click="confirmSelection()"
				>
					Confirm?
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useCalenderUIStore } from "@/stores/ui";
import { useTempLanguageStore } from "~~/stores/temp/language";
import { storeToRefs } from "pinia";

const languageChoice = useTempLanguageStore();
const { languageOffering, languageSeeking } = storeToRefs(languageChoice);
const calendarUi = useCalenderUIStore();
const { addUpcomingSessions } = useSessionStore();
const { chosenDayString, times, chosenDay } = defineProps<{
	chosenDayString: string;
	times: string[];
	chosenDay: Date;
}>();
const buttonSelection = ref(-1);
const makeSelection = (buttonIndex: number) => {
	buttonSelection.value = buttonIndex;
};
const resetButtonSelection = () => {
	buttonSelection.value = -1;
};

const confirmSelection = () => {
	const newSession = {
		languageOffering: languageOffering.value,
		languageSeeking: languageSeeking.value,
		appointmentDate: chosenDay,
		peerName: null,
	};
	addUpcomingSessions(newSession);
	resetButtonSelection();
	calendarUi.setCalendar(false);
};
</script>

<style scoped></style>
