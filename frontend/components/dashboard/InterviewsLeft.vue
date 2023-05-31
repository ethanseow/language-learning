<template>
	<div class="text-lg font-semibold flex flex-row items-center">
		<div>Interviews Left</div>
		<div class="text-green-500 text-2xl pl-1">
			{{ account.interviewsLeft }}
		</div>
	</div>
</template>
<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAccountStore } from "~~/stores/account";
const accountStore = useAccountStore();

const { account } = storeToRefs(accountStore);
</script>

<style scoped>
.text-align-center {
	line-height: 7rem;
}
</style>
