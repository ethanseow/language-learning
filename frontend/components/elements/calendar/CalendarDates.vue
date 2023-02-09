<template>
	<div class="bg-black m-auto mt h-2/3 w-1/2 justify-center">
		<div>{{ month }} {{ 2023 }}</div>
		<ArrowIcon class="rotate w-[15px] h-[15px]" />
	</div>
</template>

<script setup lang="ts">
const months = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"November",
	"October",
	"December",
];
const monthIndex = ref(1);
const month = computed(() => {
	return months[monthIndex.value];
});
</script>

<style scoped>
.rotate {
	transform: rotate(180deg);
}
</style>
