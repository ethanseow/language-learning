<template>
	<div class="flex flex-row w-full align-middle py-6">
		<LogoText class="grow" />
		<div class="flex flex-row grow justify-between items-center">
			<NuxtLink :to="urlConsts.WAITROOM">Practice</NuxtLink>
			<NuxtLink :to="urlConsts.FEATURES">How It Works</NuxtLink>
			<NuxtLink :to="urlConsts.ACCOUNT">
				<div>
					{{ account.firstName }}
				</div>
			</NuxtLink>
		</div>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAccountStore } from "~~/stores/account";

const accountStore = useAccountStore();

const { account } = storeToRefs(accountStore);
</script>
