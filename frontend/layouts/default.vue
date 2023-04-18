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
	console.log("in initAuth");
	await auth.initAuth();
	console.log("after initAuth");
	const upcomingSessions = await getSessions(false, auth.user.value.uid);
	const pastSessions = await getSessions(true, auth.user.value.uid);
	console.log(pastSessions);
	sessions.setPastSessions(pastSessions);
	sessions.setUpcomingSessions(upcomingSessions);
	console.log("past sessions", sessions.pastSessions);
	return;
};
await useAsyncData("initAuth", handler);
</script>
