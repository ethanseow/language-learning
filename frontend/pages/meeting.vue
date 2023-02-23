<template>
	<div class="text-black">
		Hello this is a meeting room {{ roomId !== "NULL" ? roomId : "" }}
		<label for="userId">Set User Id</label>
		<input
			class="border-black border-[2px]"
			name="userId"
			@input="(e) => setUserId(e)"
		/>
	</div>
</template>

<script setup lang="ts">
import { type JoinRoomReq, type JoinRoomRes } from "@/backend-api/sockets";
import { SocketEmits } from "~~/backend-api/sockets";
import { io } from "socket.io-client";
import axios from "axios";
const apiBase = useRuntimeConfig().public.apiBase;
const socket = io(apiBase, {
	withCredentials: true,
});
const userId = useCookie("userId");
const setUserId = (event: Event) => {
	userId.value = event.target.value;
};
const setCookie = () => {
	userId.value = "cookie123";
};
const roomId = ref("NULL");

onMounted(() => {
	if (!userId.value) {
		userId.value =
			String(Math.round(Math.random() * 10000)) +
			"_" +
			String(Math.round(Math.random() * 10000));
	}
	const data: JoinRoomReq = {
		userId: userId.value,
	};
	socket.emit(SocketEmits.WAIT_FOR_ROOM, data);
	socket.on(SocketEmits.JOIN_ROOM, (data: JoinRoomRes) => {
		roomId.value = data.roomId;
	});
});
</script>

<style scoped></style>
