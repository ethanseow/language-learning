<template>
	<div class="flex flex-row w-10/12 align-middle py-6 mx-auto">
		<LogoText class="grow" />
		<div
			class="flex flex-row grow justify-between items-center font-semibold"
		>
			<NuxtLink :to="urlConsts.DASHBOARD">Dashboard</NuxtLink>
			<NuxtLink :to="urlConsts.FAQ">FAQ</NuxtLink>
			<AccountDropdown v-if="auth.isLoggedIn.value" />
			<div v-else @click="modal.openModal">Login</div>
		</div>
	</div>
</template>

<script setup lang="ts">
const auth = useAuth();
const modal = useLoginModalUIStore();
</script>
<style scoped>
.point-down {
	transform: rotate(270deg);
	width: 15px;
	height: 15px;
}
</style>
