<template>
	<div>
		<Modal v-if="open" :close-modal-func="closeModal">
			<div class="text-white bg-red-500 w-96 h-96 m-auto">
				This is a modal
			</div>
		</Modal>
		<button @click="openModal" class="text-white bg-blue-700 p-4">
			Click me
		</button>
	</div>
</template>

<script setup lang="ts">
const open = ref(false);
const closeModal = () => {
	open.value = false;
};
const openModal = () => {
	open.value = true;
};
</script>

<style scoped></style>
