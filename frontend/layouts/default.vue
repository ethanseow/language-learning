<template>
	<div>
		<LoginModal :toggleModal="modal.closeModal" v-if="modal.showModal" />
		<Header />
		<slot></slot>
	</div>
</template>

<script setup lang="ts">
onMounted(() => {});
const modal = useLoginModalUIStore();
</script>
