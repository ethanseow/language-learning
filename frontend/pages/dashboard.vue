<template>
	<div class="w-full h-screen bg-background flex flex-col px-20">
		<FindPracticePortion class="self-center" />
		<div class="lg:overflow-scroll">
			<div class="w-full lg:w-[1024px]">
				<Sessions
					:use-past-session="false"
					:sessions="sessions.upcomingSessions"
				/>
				<Sessions use-past-session :sessions="sessions.pastSessions" />
			</div>
		</div>
		<Calendar v-if="showCalendar" />
	</div>
</template>
<script setup lang="ts">
import { useCalenderUIStore } from "@/stores/ui";
import { storeToRefs } from "pinia";
const sessions = useSessionStore();
definePageMeta({
	//middleware: ["auth"],
});
const calendarStore = useCalenderUIStore();
const goToIndex = () => navigateTo("/");
const { showCalendar } = storeToRefs(calendarStore);
</script>
