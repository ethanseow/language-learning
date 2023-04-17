<template>
	<div class="w-full h-screen bg-background flex flex-col px-20">
		<FindPracticePortion class="self-center" />
		<Sessions :use-past-session="false" />
		<Sessions use-past-session />
		<Calendar v-if="showCalendar" />
	</div>
</template>
<script setup lang="ts">
import { useCalenderUIStore } from "@/stores/ui";
import { storeToRefs } from "pinia";

definePageMeta({
	//	middleware: ["auth"],
});
const calendarStore = useCalenderUIStore();
const goToIndex = () => navigateTo("/");
const { showCalendar } = storeToRefs(calendarStore);
</script>
