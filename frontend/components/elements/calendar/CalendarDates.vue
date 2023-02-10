<template>
	<div class="bg-black m-auto mt h-2/3 w-1/2 justify-center">
		<div>{{ month }} {{ 2023 }}</div>
		<ArrowIcon class="rotate w-[15px] h-[15px]" />
		<table class="w-full">
			<tr>
				<th class="text-white" v-for="day in daysOfTheWeek">
					{{ day }}
				</th>
			</tr>
			<tr v-for=""></tr>
		</table>
	</div>
</template>
<style scoped>
table,
tr,
th {
	border: 1px white solid;
}
</style>

<script setup lang="ts">
const daysOfTheWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
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
const today = new Date();
// 0 is sunday - 6 is saturday
const weekIndex = computed(() => {
	return today.getDay();
});
</script>

<style scoped>
.rotate {
	transform: rotate(180deg);
}
</style>
