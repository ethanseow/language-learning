<template>
	<div class="contents">
		<slot v-if="!isLoggedIn" name="unauth"></slot>
		<slot v-else-if="isLoggedIn" name="auth"></slot>
	</div>
</template>

<script setup lang="ts">
import { useAuth } from "~~/composables/useAuth";
const auth = useAuth();

const isLoggedIn = ref(false);

if (process.server) {
	const authCookie = useCookie("authCookie");
	isLoggedIn.value = authCookie.value ? true : false;
} else {
	/*
	watch(auth.user, (newValue) => {
		isLoggedIn.value = newValue ? true : false;
	});
    */
}
// const fbAuth = useAuthState();
</script>

<style scoped></style>
