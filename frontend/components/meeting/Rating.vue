<template>
	<div>Thanks for your submission</div>
	<div>
		<form>
			<label for="Feedback">Feedback</label>
			<input
				class="text-black"
				id="feedback"
				v-model="feedback"
				name="Feedback"
			/>
		</form>
		<button id="submitFeedback" @click="submitFeedback">Submit</button>
	</div>
</template>

<script setup lang="ts">
import { DocumentData, DocumentReference } from "@firebase/firestore";

const feedback = ref();
const props = defineProps({
	doc: Object,
});

//@ts-ignore
const d: DocumentReference<DocumentData> = props.doc;
const submitFeedback = () => {
	updateRating(d, feedback.value);
};
</script>

<style scoped></style>
