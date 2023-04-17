<template>
	<div class="flex flex-row w-10/12 align-middle py-6 mx-auto">
		<LogoText class="grow" />
		<div
			class="flex flex-row grow justify-between items-center font-semibold"
		>
			<NuxtLink :to="urlConsts.DASHBOARD">Dashboard</NuxtLink>
			<NuxtLink :to="urlConsts.FAQ">FAQ</NuxtLink>
			<!--

			<NuxtLink :to="urlConsts.ACCOUNT">
				Login
				<div class="flex flex-row justify-center items-center gap-3">
					<div>{{ account.firstName }}</div>
					<ArrowIcon class="point-down" />
				</div>
			</NuxtLink>
            -->

			<AccountDropdown v-if="auth.isLoggedIn" />
			<div v-else @click="modal.openModal">Login</div>
			<!---
			<AuthWrapper>
				<template v-slot:unauth>
					<div @click="modal.openModal">Login</div>
				</template>
				<template v-slot:auth>
					<AccountDropdown />
				</template>
			</AuthWrapper>
                    -->
		</div>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAccountStore } from "~~/stores/account";
import { type Ref } from "vue";

const auth = useAuth();
// const isLoggedIn = toRef`s(auth.isLoggedIn);
// const isLoggedIn = useState("isLoggedIn", () => false);

/*
if (process.server) {
	const authCookie = useCookie("authCookie");
	isLoggedIn.value = authCookie.value ? true : false;
} else {
	watch(auth.isLoggedIn, (newValue) => {
		isLoggedIn.value = newValue ? true : false;
	});
}
*/
const modal = useLoginModalUIStore();

const accountStore = useAccountStore();

const { account } = storeToRefs(accountStore);
</script>
<style scoped>
.point-down {
	transform: rotate(270deg);
	width: 15px;
	height: 15px;
}
</style>
