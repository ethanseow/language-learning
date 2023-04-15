<template>
	<!--

	<div v-if="true || (fbAuth.auth.currentUser && initialized)">
    -->
	<div>
		<LoginModal :toggleModal="modal.closeModal" v-if="modal.showModal" />
		<Header />
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
const modal = useLoginModalUIStore();
// import { getSessions } from "~~/firebase/utils";
/*
const initialized = ref(false);
const fbAuth = useAuthState();
const { setPastSessions, setUpcomingSessions } = useSessionStore();
watch(fbAuth.currentUser, async () => {
	const upcomingSessions = await getSessions(
		false,
		// @ts-ignore
		fbAuth.auth.currentUser?.uid
	);
	const pastSessions = await getSessions(
		true,
		// @ts-ignore
		fbAuth.auth.currentUser?.uid
	);
	setPastSessions(pastSessions);
	setUpcomingSessions(upcomingSessions);
	initialized.value = true;
});
*/
</script>
