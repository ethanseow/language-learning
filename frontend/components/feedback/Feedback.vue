<template>
	<div
		class="bg-cyan-200 fixed flex flex-col items-center justify-center inset-0 w-[500px] h-[400px] text-white gap-2"
	>
		<p class="">
			Your Session on
			<span class="text-blue-600">
				{{ time }}
			</span>
		</p>
		<p>
			Feedback from
			<span class="text-purple-600">
				{{ props.feedbackOwner }}
			</span>
		</p>
		<div
			class="text-black bg-white p-10 h-[300px] w-[400px] overflow-y-auto"
		>
			{{ props.feedbackText }}
		</div>
	</div>
</template>

<script setup lang="ts">
const props = defineProps<{
	feedbackDate: Date;
	feedbackText: string;
	feedbackOwner: string;
}>();
const time = formatDate(props.feedbackDate);
</script>

<style scoped></style>
