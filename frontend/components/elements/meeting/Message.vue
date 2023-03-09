<template>
	<div>
		<div v-if="message.ownerId == `system`" class="bg-green-300 p-4">
			{{ message.data }}
		</div>
		<div :class="myMessageCSS" class="p-4">{{ message.data }}</div>
	</div>
</template>

<script setup lang="ts">
import { type Message } from "@/backend-api/sockets";
import { useAccountStore } from "~~/stores/account";
const accountStore = useAccountStore();
const myMessageCSS = computed(() => {
	console.log("Message's Owner Id", message.ownerId);
	console.log("Current Account's id", accountStore.account.userId);
	if (message.ownerId != accountStore.account.userId) {
		return "bg-blue-500";
	}
	return "bg-white text-black";
});
const { message } = defineProps<{
	message: Message;
}>();
</script>

<style scoped></style>
