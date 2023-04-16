<template>
	<div class="text-white">This is the test page</div>
</template>

<script setup lang="ts">
const auth = useAuth();
if (process.server) {
	console.log("I am on the server");
	await getUser("123");
}
</script>
<style scoped></style>
