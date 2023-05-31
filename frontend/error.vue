<template>
	<div>This is the error page</div>
	<div>
		{{ error.statusCode }}
	</div>
	<div>
		{{ error.message }}
	</div>
</template>

<script setup lang="ts">
defineProps(["error"]);
</script>

<style scoped></style>
