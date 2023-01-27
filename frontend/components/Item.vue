<template>
	<div>Name: {{ itemName }}</div>
	<div>Price: {{ itemPrice }}</div>
	<div>Stock Amount: {{ itemStock }}</div>
</template>

<script setup lang="ts">
const { itemName, itemPrice, itemStock } = defineProps<{
	itemName: string;
	itemPrice: number;
	itemStock: number;
}>();
</script>
