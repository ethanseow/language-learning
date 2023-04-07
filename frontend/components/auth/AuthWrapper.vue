<template>
	<div class="contents">
		<NuxtLink v-if="!userIsLoggedIn" to="/login">
			<slot name="unauth"></slot>
		</NuxtLink>
		<slot v-else name="auth"></slot>
	</div>
</template>

<script setup lang="ts">
import { Auth } from "@firebase/auth";

const userIsLoggedIn = ref(false);
onMounted(() => {
	userIsLoggedIn.value = auth.currentUser == null;
	auth.onAuthStateChanged(function (user) {
		if (user) {
			userIsLoggedIn.value = true;
		} else {
			userIsLoggedIn.value = false;
		}
	});
});
const auth: Auth = useNuxtApp().$auth;
</script>

<style scoped></style>
