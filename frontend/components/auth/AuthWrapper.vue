<template>
	<div class="contents">
		<slot v-if="!fbAuth.isLoggedIn" @click="" name="unauth"></slot>
		<slot v-else name="auth"></slot>
	</div>
</template>

<script setup lang="ts">
import { Auth } from "@firebase/auth";

const fbAuth = useAuthState();
</script>

<style scoped></style>
