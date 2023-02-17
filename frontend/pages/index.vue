<template>
	<div class="w-screen h-screen default-bg flex flex-col px-20">
		<Header />
		<FindPracticePortion class="self-center" />
		<Sessions :use-past-session="false" />
		<Sessions use-past-session />
		<Calendar v-if="showCalendar" />
	</div>
</template>
<script setup lang="ts">
import { useCalenderUIStore } from "@/stores/ui";
import { storeToRefs } from "pinia";
const calendarStore = useCalenderUIStore();
const { showCalendar } = storeToRefs(calendarStore);
</script>
