<template>
	<div class="w-full">
		<span class="font-semibold text-2xl"> Past Sessions </span>
		<div class="w-full h-[2px] bg-black"></div>
		<table class="w-full text-black text-sm font-thin">
			<tr class="bg-gray-400 text-lg">
				<th>Held On</th>
				<th>Language</th>
				<th>Your Work</th>
				<th>Peer</th>
				<th>Peer Feedback</th>
			</tr>
			<tr v-for="session in pastSessions" class="bg-gray-400">
				<td>
					<div>{{ getDateTimeString(session.appointmentDate) }}</div>
				</td>
				<td class="flex justify-center">
					<div class="text-sm flex flex-row gap-3 w-max items-center">
						<span>{{ session.languageLearning }}</span>
						<img
							src="/img/china.png"
							class="w-[30px] aspect-auto"
						/>
					</div>
				</td>
				<td>
					<button
						class="text-green-400 border-green-400 border-[2px] py-1 px-6 rounded-md"
					>
						View
					</button>
				</td>
				<td>
					<NuxtLink
						to="/accounts/123"
						class="underline text-secondary underline-offset-2"
					>
						{{ session.peerName }}
					</NuxtLink>
				</td>
				<td>
					<button
						class="text-green-400 border-green-400 border-[2px] py-1 px-6 rounded-md"
					>
						View
					</button>
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
	background-color: rgb(156 163 175);
}
tr:nth-child(even) {
	background-color: white;
}
tr:not(:first-child) td {
	padding: 1rem 0 1rem 0;
}
</style>

<script setup lang="ts">
import { storeToRefs } from "pinia";
const { upcomingSessions, pastSessions } = storeToRefs(useSessionStore());

const getDateTimeString = (date: Date) => {
	return `${
		months[date.getMonth()]
	} ${date.getDate()}, ${date.getFullYear()} - ${date.toLocaleString(
		"en-US",
		{ hour: "numeric", minute: "numeric", hour12: true }
	)}`;
};
</script>
