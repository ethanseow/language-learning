<template>
	<div>
		<LoginModal :toggleModal="modal.closeModal" v-if="modal.showModal" />
		<HeaderVue />
		<slot></slot>
	</div>
</template>

<script setup lang="ts">
import HeaderVue from "~~/components/portions/Header.vue";
import { getSessions } from "~~/utils/firebase";
const modal = useLoginModalUIStore();
const auth = useAuth();
const sessions = useSessionStore();
const handler = async () => {
	const nuxtApp = useNuxtApp();
	await auth.initAuth();
	const upcomingSessions = await getSessions(
		nuxtApp.$firestore,
		false,
		auth.user.value.uid
	);
	const pastSessions = await getSessions(
		nuxtApp.$firestore,
		true,
		auth.user.value.uid
	);
	sessions.setPastSessions(pastSessions);
	sessions.setUpcomingSessions(upcomingSessions);
};
await useAsyncData("initAuth", handler);
</script>
