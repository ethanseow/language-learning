<template>
	<div class="w-full flex flex-col items-center mb-3">
		<div>
			<p class="text-2xl font-semibold md:text-center">
				Practice Makes Perfect
			</p>
		</div>
		<div>
			<button
				class="bg-secondary p-3 text-2xl font-semibold text-stroke border-white border-[1.5px]"
				@click="setCalendar(true)"
			>
				Find Practice Sessions
			</button>
			<div class="flex flex-row justify-between w-full">
				<InterviewsLeft />
				<GetMoreFree />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useCalenderUIStore } from "@/stores/ui";
const calendarStore = useCalenderUIStore();
const { showCalendar, setCalendar } = calendarStore;
</script>
