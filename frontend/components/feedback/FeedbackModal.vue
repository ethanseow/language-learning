<template>
	<div>
		<Feedback
			v-if="feedback.feedback.length != 0"
			:feedbackDate="feedback.appointmentDate"
			:feedbackText="feedback.feedback"
			:feedbackOwner="feedback.fromName"
		/>
	</div>
</template>

<script setup lang="ts">
import { Feedback } from "~~/utils/firebase";

const props = defineProps<{
	sessionId: string;
}>();

const sessionStore = useSessionStore();
const feedback: Feedback = sessionStore.feedback[props.sessionId];
</script>

<style scoped></style>
