<template>
	<div
		class="w-full flex flex-col justify-center items-center text-[#1D4ED8] h-full gap-5"
	>
		<div>{{ props.chosenDayString }}</div>
		<div class="overflow-y-auto w-full flex flex-col items-center">
			<div
				v-for="(time, index) in times"
				class="text-center border-backgroundSecondary border-2 mb-2 rounded-md w-full bg-[#b0c2f4]"
			>
				<div
					v-if="buttonSelection != index"
					class="p-4"
					@click="makeSelection(index)"
				>
					{{ toTimeString(time) }}
				</div>
				<div
					v-if="buttonSelection == index"
					class="bg-white text-black h-full w-full p-4"
					@click="confirmSelection(time)"
				>
					Confirm?
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import uniqid from "uniqid";
import { useTempLanguageStore } from "~~/stores/temp/language";
import { storeToRefs } from "pinia";
import { Time } from "~~/utils/time";
import { Session } from "~~/stores/sessions";
const fbAuth = useAuth();
const languageChoice = useTempLanguageStore();
const { languageOffering, languageSeeking } = storeToRefs(languageChoice);
const { addUpcomingSessions } = useSessionStore();
const props = defineProps<{
	chosenDayString: string;
	times: Time[];
	chosenDay: Date;
}>();
const { chosenDayString, times, chosenDay } = toRefs(props);

const buttonSelection = ref(-1);
const makeSelection = (buttonIndex: number) => {
	buttonSelection.value = buttonIndex;
};
const resetButtonSelection = () => {
	buttonSelection.value = -1;
};

const calendarFlowUiStore = useCalendarUIFlowStore();
const { setCalendarFlowState, setTempData } = calendarFlowUiStore;

const confirmSelection = (time: Time) => {
	const date = new Date(chosenDay.value);
	date.setHours(time.hours, time.minutes);
	const newSession: Session = {
		id: uniqid(),
		languageOffering: languageOffering.value,
		languageSeeking: languageSeeking.value,
		appointmentDate: date,
		peerName: null,
		userId: fbAuth.user.value.uid,
	};
	addUpcomingSessions(newSession);
	resetButtonSelection();
	setTempData({
		appointmentDate: date,
		languageSeeking: languageSeeking.value,
		languageOffering: languageOffering.value,
	});
	setCalendarFlowState(CalendarFlow.ThankYouSignupOverlay);
};
</script>

<style scoped></style>
