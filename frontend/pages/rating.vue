<template>
	<div
		v-if="hasSubmitted"
		class="fixed w-screen h-screen inset-0 bg-background text-center"
	>
		Thanks for your submission
	</div>
	<div>
		<form>
			<label for="Feedback">Feedback</label>
			<input v-model="feedback" name="Feedback" />
		</form>
		<button @click="submitFeedback">Submit</button>
	</div>
</template>

<script setup lang="ts">
const rating = useRatingStore();
const hasSubmitted = ref(false);
const feedback = ref("");

const submitFeedback = () => {
	if (feedback.value && rating.doc) {
		updateRating(rating.doc, feedback.value);
		hasSubmitted.value = true;
	}
};
</script>

<style scoped></style>
