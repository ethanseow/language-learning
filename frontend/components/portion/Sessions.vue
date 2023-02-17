<template>
	<div class="w-full">
		<span class="font-semibold text-2xl">
			{{ usePastSession ? "Past Sessions" : "Upcoming Sessions" }}
		</span>
		<div class="w-full h-[2px] bg-black"></div>
		<table class="w-full text-black text-sm font-thin">
			<tr class="bg-gray-400 text-lg">
				<th>Date</th>
				<th>Language Offering</th>
				<th>Language Seeking</th>
				<th>Peer</th>
				<th>Peer Feedback</th>
			</tr>
			<tr v-for="session in sessions" class="bg-gray-400">
				<td>
					<div>{{ getDateTimeString(session.appointmentDate) }}</div>
				</td>
				<td>
					<div
						class="text-sm flex flex-row gap-3 w-full items-center justify-center"
					>
						<span>{{ session.languageOffering }}</span>
						<img
							:src="getFlagFromLang(session.languageOffering)"
							class="w-[30px] aspect-auto"
						/>
					</div>
				</td>
				<td>
					<div
						class="text-sm flex flex-row gap-3 w-full items-center justify-center"
					>
						<span>{{ session.languageSeeking }}</span>
						<img
							:src="getFlagFromLang(session.languageSeeking)"
							class="w-[30px] aspect-auto"
						/>
					</div>
				</td>
				<td>
					<NuxtLink
						to="/accounts/123"
						v-if="usePastSession"
						class="underline text-secondary underline-offset-2"
					>
						{{ session.peerName }}
					</NuxtLink>
					<div v-else class="text-black font-thin">N/A</div>
				</td>
				<td>
					<button
						v-if="usePastSession"
						class="text-green-400 border-green-400 border-[2px] py-1 px-6 rounded-md"
					>
						View
					</button>
					<div v-else class="text-black font-thin">N/A</div>
				</td>
			</tr>
		</table>
	</div>
</template>
<style scoped>
table {
	table-layout: fixed;
	text-align: center;
}
tr:nth-child(odd) {
	background-color: rgb(197, 197, 197);
}
tr:nth-child(even) {
	background-color: white;
}
tr:not(:first-child) td {
	padding: 1rem 0 1rem 0;
}
</style>

<script setup lang="ts">
import { type ComputedRef } from "vue";
import { storeToRefs } from "pinia";
import { Session } from "~~/stores/sessions";
const { upcomingSessions, pastSessions } = storeToRefs(useSessionStore());
const { usePastSession } = defineProps<{
	usePastSession: boolean | null;
}>();
console.log(usePastSession);
const sessions = usePastSession ? pastSessions : upcomingSessions;
const getDateTimeString = (date: Date) => {
	return `${
		months[date.getMonth()]
	} ${date.getDate()}, ${date.getFullYear()} - ${date.toLocaleString(
		"en-US",
		{ hour: "numeric", minute: "numeric", hour12: true }
	)}`;
};
</script>
