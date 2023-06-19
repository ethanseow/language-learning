<template>
	<div
		class="w-screen bg-background opacity-50 h-screen fixed top-0 left-0 z-[0]"
	></div>
	<div
		class="modal fixed w-screen h-screen z-[1] top-0 left-0 flex flex-col opacity-100"
	>
		<slot> </slot>
	</div>
</template>

<script setup lang="ts"></script>

<style scoped></style>
