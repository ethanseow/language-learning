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
import { type Session } from "~~/stores/sessions";
const props = defineProps<{ session: Session; close: Function }>();

const time = formatDate(props.session.appointmentDate);
const f = computed(() => {
	return useSessionStore().feedback.find((f) => {
		return f?.sessionId == props.session.id;
	});
});
const name = f.value?.fromName;
const feedbackText = f.value?.feedback;
onMounted(() => {
	console.log("onMounted props.sessionId", props.session.id);
	const a = () => {
		return useSessionStore().feedback.find((f) => {
			return f?.sessionId == props.session.id;
		});
	};
	console.log("onMounted find feedback for session", a());
	console.log("onMounted", f.value);
});
</script>

<style scoped></style>
