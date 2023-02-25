<template>
	<div class="text-black flex flex-col justify-center items-center">
		<div>Hello this is a lobby room</div>
		<div>
			Your UserID:
			{{ userId ? userId : "UNKNOWN USERID" }}
		</div>
		<div class="p-4 bg-purple-600 w-max">
			<NuxtLink to="/meeting"> Find Room </NuxtLink>
		</div>
	</div>
</template>

<script setup lang="ts">
const userId = useCookie("userId");
const roomId = ref("NULL");

onMounted(() => {
	if (!userId.value) {
		userId.value =
			String(Math.round(Math.random() * 10000)) +
			"_" +
			String(Math.round(Math.random() * 10000));
	}
});
</script>

<style scoped></style>
