<template>
	<div v-for="item in items">
		<Item
			:item-name="item.name"
			:item-price="item.price"
			:item-stock="item.stock"
		/>
	</div>
	<div>This is the bathroom page</div>
</template>

<script setup lang="ts">
import { useBathroomStore } from "~~/stores/Bathroom";
const { items } = useBathroomStore();
</script>
