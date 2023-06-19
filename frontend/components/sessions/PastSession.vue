<template>
	<tr>
		<td>
			<div>{{ getDateTimeString(props.appointmentDate) }}</div>
		</td>
		<td>
			<div
				class="text-sm flex flex-row gap-3 w-full items-center justify-center"
			>
				<span>{{ props.languageOffering }}</span>
				<img
					:src="getFlagFromLang(props.languageOffering)"
					class="w-[30px] aspect-auto"
				/>
			</div>
		</td>
		<td>
			<div
				class="text-sm flex flex-row gap-3 w-full items-center justify-center"
			>
				<span>{{ props.languageSeeking }}</span>
				<img
					:src="getFlagFromLang(props.languageSeeking)"
					class="w-[30px] aspect-auto"
				/>
			</div>
		</td>
		<td>
			<NuxtLink
				to="/accounts/123"
				class="underline text-secondary underline-offset-2"
			>
				{{ props.peerName }}
			</NuxtLink>
		</td>
		<td>
			<button
				@click="openFeedbackModal(session)"
				class="text-green-400 border-green-400 border-[2px] py-1 px-6 rounded-md"
			>
				View
			</button>
		</td>
		<td></td>
	</tr>
</template>

<script setup lang="ts">
const props = defineProps<{
	peerfeedback: string;
	peerName: string;
	languageSeeking: string;
	languageOffering: string;
	appointmentDate: Date;
}>();

const getDateTimeString = (date: Date) => {
	return `${
		months[date.getMonth()]
	} ${date.getDate()}, ${date.getFullYear()} - ${date.toLocaleString(
		"en-US",
		{ hour: "numeric", minute: "numeric", hour12: true }
	)}`;
};
</script>

<style scoped></style>
