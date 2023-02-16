<template>
	<div
		class="w-screen bg-background opacity-50 h-screen fixed top-0 left-0 z-[0]"
	></div>
	<div
		id="outside-calendar"
		class="fixed w-screen h-screen z-[1] top-0 left-0 flex flex-col"
	>
		<CalendarDates
			v-click-outside:outside-calendar="(e) => closeCalendar(e)"
		/>
	</div>
</template>

<script setup lang="ts">
const calendarUi = useCalenderUIStore();
const closeCalendar = (event: Event) => {
	console.log("closing calendar");
	event.stopPropagation();
	calendarUi.setCalendar(false);
};
</script>
