<template>
	<div
		class="w-screen bg-background opacity-50 h-screen fixed top-0 left-0 z-[0]"
	></div>
	<div
		:id="ids.outsideCalendar"
		class="fixed w-screen h-screen z-[1] top-0 left-0 flex flex-col"
	>
		<div class="w-fit h-fit m-auto">
			<CalendarDates
				v-if="calendarFlowState == CalendarFlow.CalendarOverlay"
				v-click-outside="d"
			/>
			<ThankYouSignUp
				v-click-outside="d"
				v-else-if="
					calendarFlowState == CalendarFlow.ThankYouSignupOverlay
				"
				:appointment-date="tempData.appointmentDate"
				:language-offering="tempData.languageOffering"
				:language-seeking="tempData.languageSeeking"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ids } from "@/utils/clickOutsideId";
import { storeToRefs } from "pinia";
const calendarUi = useCalenderUIStore();
const calendarFlowUiStore = useCalendarUIFlowStore();
const { setCalendarFlowState, setTempData } = calendarFlowUiStore;
const { calendarFlowState, tempData } = storeToRefs(calendarFlowUiStore);
const d = {
	id: ids.outsideCalendar,
	func: (e: Event) => closeCalendar(e),
};
const d2 = {
	id: ids.outsideCalendar,
	func: (e: Event) => closeCalendar(e),
};
const closeCalendar = (event: Event) => {
	console.log("closing calendar");
	event.stopPropagation();
	resetCalendarUi();
};
</script>
