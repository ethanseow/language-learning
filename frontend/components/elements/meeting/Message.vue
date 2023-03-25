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
// need to change this to be related to account - use local storage atm
// const accountStore = useAccountStore();

const userId = useCookie("userId");

const myMessageCSS = computed(() => {
	console.log("Message's Owner Id", message.ownerId);
	console.log("Current Account's id", userId.value);
	if (message.ownerId == userId.value) {
		return "bg-blue-500";
	}
	return "bg-white text-black";
});
const { message } = defineProps<{
	message: Message;
}>();
</script>

<style scoped></style>
