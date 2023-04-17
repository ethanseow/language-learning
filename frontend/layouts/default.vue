<template>
	<!--

	<div v-if="true || (fbAuth.auth.currentUser && initialized)">
    -->

	<div>
		<LoginModal :toggleModal="modal.closeModal" v-if="modal.showModal" />
		<HeaderVue />
		<slot></slot>
	</div>
	<!--
	<div
		class="w-full h-full fixed top-0 left-0 bg-white flex justify-center items-center"
	>

		<LoadingSpinner class="w-max" />
	</div>
        -->
</template>

<script setup lang="ts">
import HeaderVue from "~~/components/portions/Header.vue";
const modal = useLoginModalUIStore();
const auth = useAuth();
await useAsyncData("initAuth", () => auth.initAuth());
</script>
