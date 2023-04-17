<template>
	<div class="relative" id="account-dropdown">
		<div class="flex gap-2 bg-secondary px-2 py-1" @click="toggleDropdown">
			<h1 class="text-white">
				{{ auth.user.value.username }}
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
import jwt_decode from "jwt-decode";
const authCookie = useCookie("authCookie");
const auth = useAuth();

const canShowDropdown = ref(false);
const toggleDropdown = () => {
	canShowDropdown.value = !canShowDropdown.value;
};

/*
if (process.server) {
	if (authCookie.value) {
		const decoded = jwt_decode(authCookie.value);
		//@ts-ignore
		const uid: string = decoded.user_id;
		const user = await getUser(uid);
		username.value = user?.username;
	}
} else {
	watch(auth.user, async (newUser) => {
		//@ts-ignore
		if (newUser) {
			username.value = newUser.username;
		} else {
			username.value = "";
		}
	});
}
*/
</script>

<style scoped>
.arrow-down {
	transform: rotate(270deg);
}
</style>
