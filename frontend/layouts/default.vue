<template>
	<div>
		<LoginModal :toggleModal="modal.closeModal" v-if="modal.showModal" />
		<HeaderVue />
		<slot></slot>
	</div>
</template>

<script setup lang="ts">
import HeaderVue from "~~/components/portions/Header.vue";
const modal = useLoginModalUIStore();
const auth = useAuth();
await useAsyncData("initAuth", () => auth.initAuth());
</script>
