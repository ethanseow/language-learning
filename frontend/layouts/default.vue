<template>
	<div>
		<LoginModal :toggleModal="modal.closeModal" v-if="modal.showModal" />
		<Header />
		<slot></slot>
	</div>
</template>

<script setup lang="ts">
import { Pinia } from "pinia";
import Header from "~~/components/portions/Header.vue";
import { getSessions } from "~~/utils/firebase";
const modal = useLoginModalUIStore();
const auth = useAuth();
const sessions = useSessionStore();
/*
watch(auth.isLoggedIn, async (newIsLoggedIn, oldIsLoggedIn) => {
	const nuxtApp = useNuxtApp();
	// not logged in at all
	if (newIsLoggedIn == false) {
		sessions.setPastSessions([]);
		sessions.setUpcomingSessions([]);
	}
	// just signed out
	if (!newIsLoggedIn && oldIsLoggedIn) {
		sessions.setPastSessions([]);
		sessions.setUpcomingSessions([]);
	}
	// just logged in
	if (!oldIsLoggedIn && newIsLoggedIn) {
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
	}
});
*/
</script>
