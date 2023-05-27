<template>
	<div>
		<div :class="myMessageCSS" class="p-4">{{ message.message }}</div>
	</div>
</template>

<script setup lang="ts">
import { useAccountStore } from "~~/stores/account";
import { Message } from "~~/utils/RTCMocker";
// need to change this to be related to account - use local storage atm
// const accountStore = useAccountStore();

const userId = useCookie("userId");

const myMessageCSS = computed(() => {
	if (message.isMine) {
		return "bg-blue-500 text-white";
	}
	return "bg-white text-black";
});
const { message } = defineProps<{
	message: Message;
}>();
</script>

<style scoped></style>
