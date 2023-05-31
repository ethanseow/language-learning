<template>
	<div class="w-1/3 flex flex-col items-center mb-3">
		<p class="text-2xl font-semibold">Practice Makes Perfect</p>
		<FindPracticeButton @click="setCalendar(true)" />
		<div class="flex flex-row justify-between w-full">
			<InterviewsLeft />
			<GetMoreFree />
		</div>
	</div>
</template>

<script setup lang="ts">
import { useCalenderUIStore } from "@/stores/ui";
const calendarStore = useCalenderUIStore();
const { showCalendar, setCalendar } = calendarStore;
</script>
