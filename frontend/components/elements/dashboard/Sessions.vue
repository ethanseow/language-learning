<template>
	<div class="bg-backgroundSecondary flex flex-col border-white border-[1px]">
		<div class="flex flex-row p-2 font-medium text-lg">
			<div>{{ date }}</div>
			<div
				v-if="peerName"
				class="flex flex-row grow justify-center gap-3 items-center"
			>
				<div class="">{{ peerName }}</div>
				<SendMessage />
			</div>
		</div>
		<div class="border-y-[1px] border-white p-2 flex flex-row gap-2">
			<div class="flex flex-col gap-2">
				<div
					v-if="peerName"
					class="p-2 border-white border-[2px] w-max font-medium text-lg bg-green-500"
				>
					Peer Feedback
				</div>
				<div
					class="p-2 border-white border-[2px] w-max font-medium text-lg bg-blue-500"
				>
					Your Work
				</div>
			</div>
			<div class="border-[1px] border-white w-[300px] h-[150px]">
				<img :src="imageUrl" class="w-full h-full" />
			</div>
		</div>
		<div class="text-center bg-red-800 w-full">{{ languageLearning }}</div>
	</div>
</template>

<script setup lang="ts">
const { appointmentDate, languageLearning, peerName } = defineProps<{
	appointmentDate: Date;
	languageLearning: string;
	peerName: string | null;
}>();

const date = computed(() => {
	return `${appointmentDate.getMonth() + 1}/${appointmentDate.getDate()}`;
});
const time = computed(() => {
	return `${appointmentDate.getHours()}:${appointmentDate.getMinutes()}`;
});
const imageUrl = getImageFromLang(languageLearning);
console.log(imageUrl);
</script>
