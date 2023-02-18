<template>
	<div
		class="w-screen bg-background opacity-50 h-screen fixed top-0 left-0 z-[0]"
	></div>
	<div
		id="outside-calendar"
		class="fixed w-screen h-screen z-[1] top-0 left-0 flex flex-col"
	>
		<CalendarDates
			v-if="calendarFlowState == CalendarFlow.CalendarOverlay"
			v-click-outside:outside-calendar="(e) => closeCalendar(e)"
		/>
		<ThankYouSignUp
			v-click-outside:outside-calendar="(e) => closeCalendar(e)"
			v-else-if="calendarFlowState == CalendarFlow.ThankYouSignupOverlay"
			:appointment-date="tempData.appointmentDate"
			:language-offering="tempData.languageOffering"
			:language-seeking="tempData.languageSeeking"
		/>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
const calendarUi = useCalenderUIStore();
const calendarFlowUiStore = useCalendarUIFlowStore();
const { setCalendarFlowState, setTempData } = calendarFlowUiStore;
const { calendarFlowState, tempData } = storeToRefs(calendarFlowUiStore);
const closeCalendar = (event: Event) => {
	console.log("closing calendar");
	event.stopPropagation();
	resetCalendarUi();
};
</script>
