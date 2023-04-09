<template>
	<div class="relative" id="account-dropdown">
		<div class="flex gap-2 bg-secondary px-2 py-1" @click="toggleDropdown">
			<h1 class="text-white">
				{{ auth.username.value }}
			</h1>
			<ArrowIcon class="arrow-down w-[15px]" />
		</div>
		<div
			v-if="canShowDropdown"
			class="absolute right-0 p-2 flex flex-col gap-3 w-max bg-secondary text-black text-center"
		>
			<p>Account Settings</p>
			<p>Mic/Camera</p>
			<p @click="auth.signOut">Sign Out</p>
		</div>
	</div>
</template>

<script setup lang="ts">
const auth = useAuthState();
const canShowDropdown = ref(false);
const toggleDropdown = () => {
	canShowDropdown.value = !canShowDropdown.value;
};
</script>

<style scoped>
.arrow-down {
	transform: rotate(270deg);
}
</style>
