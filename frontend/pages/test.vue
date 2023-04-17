<template>
	<div class="text-white">This is the test page</div>
	<div>isLoggedIn:{{ auth.isLoggedIn }}</div>
	<div>user:{{ auth.user }}</div>
</template>

<script setup lang="ts">
const auth = useAuth();
</script>
<style scoped></style>
