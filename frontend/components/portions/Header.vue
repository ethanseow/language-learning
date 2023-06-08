<template>
	<div class="flex flex-row w-10/12 align-middle py-6 mx-auto">
		<LogoText class="grow" />
		<div
			class="flex flex-row grow justify-between items-center font-semibold"
		>
			<NuxtLink :to="dashboard">Dashboard</NuxtLink>
			<NuxtLink :to="faq">FAQ</NuxtLink>
			<AccountDropdown v-if="auth.isLoggedIn.value" />
			<div v-else @click="modal.openModal">Login</div>
			<LanguageChanger />
		</div>
	</div>
</template>

<script setup lang="ts">
const auth = useAuth();
const modal = useLoginModalUIStore();

const localeRoute = useLocaleRoute();
const { locale } = useI18n();
const dashboard = computed(() => {
	const route = localeRoute(urlConsts.DASHBOARD, locale.value);
	return route != null ? route.path : "/";
});
const faq = computed(() => {
	const route = localeRoute(urlConsts.FAQ, locale.value);
	return route != null ? route.path : "/";
});
</script>
<style scoped>
.point-down {
	transform: rotate(270deg);
	width: 15px;
	height: 15px;
}
</style>
