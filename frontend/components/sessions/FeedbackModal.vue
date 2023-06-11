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
				{{ name }}
			</span>
		</p>
		<div
			class="text-black bg-white p-10 h-[300px] w-[400px] overflow-y-auto"
		>
			{{ feedbackText }}
		</div>
	</div>
</template>

<script setup lang="ts">
import { searchRating } from "~~/utils/firebase";

const props = defineProps({ sessionId: String, close: Function });

const time = "February 9th at 1:00 PM";
const name = "Bobby";
const feedbackText = "This is some feedback";
const f = computed(() => {
	return useSessionStore().feedback.find((f) => {
		return f?.sessionId == props.sessionId;
	});
});
onMounted(() => {
	console.log("onMounted props.sessionId", props.sessionId);
	const a = () => {
		return useSessionStore().feedback.find((f) => {
			return f?.sessionId == props.sessionId;
		});
	};
	console.log("onMounted find feedback for session", a());
	console.log("onMounted", f.value);
});
</script>

<style scoped></style>
