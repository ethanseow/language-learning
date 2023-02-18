<template>
	<div class="text-sm flex flex-row gap-3 w-full items-center justify-center">
		<span>{{ props.language }}</span>
		<img
			:src="getFlagFromLang(props.language)"
			class="w-[30px] aspect-auto"
		/>
	</div>
</template>

<script setup lang="ts">
const props = defineProps<{
	language: string;
}>();
</script>

<style scoped></style>
