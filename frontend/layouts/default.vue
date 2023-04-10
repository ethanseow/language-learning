<template>
	<div v-if="fbAuth.isLoggedIn.value">
		<LoginModal :toggleModal="modal.closeModal" v-if="modal.showModal" />
		<Header />
		<slot></slot>
	</div>
	<div
		v-else
		class="w-full h-full fixed top-0 left-0 bg-white flex justify-center items-center"
	>
		<!--

		<LoadingSpinner class="w-max" />
        -->
	</div>
</template>

<script setup lang="ts">
const fbAuth = useAuthState();
const modal = useLoginModalUIStore();
</script>
