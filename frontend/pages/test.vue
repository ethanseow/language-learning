<template>
	<div class="text-white">This is the test page</div>
	<div>isLoggedIn:{{ auth.isLoggedIn }}</div>
	<div>user:{{ auth.user }}</div>
</template>

<script setup lang="ts">
definePageMeta({
	middleware: ["auth"],
	validate: () => {
		return true;
	},
});
const auth = useAuth();
onMounted(async () => {
	console.log("public", useRuntimeConfig().public);
	/*
	//const user = await getUser("2Uxv8sPDFdNoErHwEjjjtUmdMbQ2");
	console.log("user is", user);
	console.log("apiBase", useRuntimeConfig().public.apiBase);
	console.log("projectId", useRuntimeConfig().public.projectId);
    */
});
</script>
<style scoped></style>
