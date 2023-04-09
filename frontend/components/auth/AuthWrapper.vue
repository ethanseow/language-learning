<template>
	<div class="contents">
		<slot v-if="!userIsLoggedIn" @click="" name="unauth"></slot>
		<slot v-else name="auth"></slot>
	</div>
</template>

<script setup lang="ts">
import { Auth } from "@firebase/auth";

const userIsLoggedIn = ref(false);
onMounted(() => {
	auth.onAuthStateChanged(function (user) {
		if (user) {
			userIsLoggedIn.value = true;
		} else {
			userIsLoggedIn.value = false;
		}
	});
	userIsLoggedIn.value = auth.currentUser == null;
});
const auth: Auth = useNuxtApp().$auth;
</script>

<style scoped></style>
