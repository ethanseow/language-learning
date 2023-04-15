<template>
	<div class="relative" id="account-dropdown">
		<div class="flex gap-2 bg-secondary px-2 py-1" @click="toggleDropdown">
			<h1 class="text-white">
				{{ username }}
			</h1>
			<ArrowIcon class="arrow-down w-[15px]" />
		</div>
		<div
			v-if="canShowDropdown"
			class="absolute right-0 p-2 flex flex-col gap-3 w-max bg-secondary text-black text-center"
		>
			<p>Account Settings</p>
			<p>Mic/Camera</p>
			<p @click="auth.logout">Sign Out</p>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useAuth } from "~~/composables/useAuth";
import { getUser } from "~~/utils/firebase.js";
const authCookie = useCookie("authCookie");
const auth = useAuth();
const username = ref();

watch(auth.user, async (newUser) => {
	const uid = newUser.uid;
	const name = await getUser(uid);
	username.value = name;
});

const canShowDropdown = ref(false);
const toggleDropdown = () => {
	canShowDropdown.value = !canShowDropdown.value;
};
if (process.server && authCookie.value) {
	const jwt = require("jsonwebtoken");
	const decoded = jwt.decode(authCookie.value);
	const uid: string = decoded.uid;
	const user = await getUser(uid);
	username.value = user?.username;
}
</script>

<style scoped>
.arrow-down {
	transform: rotate(270deg);
}
</style>
