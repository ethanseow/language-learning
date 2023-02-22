<template>
	<div class="text-black">Hello this is a meeting room</div>
</template>

<script setup lang="ts">
import { type JoinRoomReq, routes } from "@/backend-api/route";
import axios from "axios";
const userId = useCookie("userId");
const apiBase = useRuntimeConfig().public.apiBase;
onMounted(async () => {});
const joinRoom = async () => {
	const data: JoinRoomReq = {
		userId: userId.value,
	};
	const resp = await axios.post(`${apiBase}/join-room`, data);
	console.log(resp.data);
};
</script>

<style scoped></style>
