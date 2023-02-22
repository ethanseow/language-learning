<template>
	<div class="text-black">
		<label for="userId">Set User Id</label>
		<input
			class="border-black border-[2px]"
			name="userId"
			@input="(e) => setUserId(e)"
		/>
		<NuxtLink to="/meeting">Find Room</NuxtLink>
	</div>
</template>

<script setup lang="ts">
const rand = String(Math.random() * 10000);
const userId = useCookie("userId");
const setUserId = (event: Event) => {
	userId.value = event.target.value;
};
</script>

<style scoped></style>
