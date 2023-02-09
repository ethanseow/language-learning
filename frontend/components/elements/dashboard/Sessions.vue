<template>
	<div class="bg-backgroundSecondary flex flex-col border-white border-[1px]">
		<div class="flex flex-row p-2 font-medium text-lg">
			<div>{{ appointmentDate }}</div>
			<div class="flex flex-row grow justify-center gap-3 items-center">
				<div class="">{{ peerName }}</div>
				<SendMessage />
			</div>
		</div>
		<div class="border-y-[1px] border-white p-2 flex flex-row gap-2">
			<div class="flex flex-col gap-2">
				<div
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
			<div class="border-[1px] border-white w-max">
				<img :src="imageUrl" />
			</div>
		</div>
		<div class="text-center bg-red-800 w-full">{{ languageLearning }}</div>
	</div>
</template>

<script setup lang="ts">
const appointmentDate = "1/22";
const peerName = "Bobby Schmurdah";
const imageUrl = computed(() => {
	let fileName = "beijing.jpg";
	return new URL(`/assets/images/${fileName}`, import.meta.url).href;
});
const languageLearning = "Mandarin";
</script>
