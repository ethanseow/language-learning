<template>
	<div class="bg-black m-auto mt h-2/3 w-1/2 justify-center">
		<div>{{ month }} {{ today.getFullYear() }}</div>
		<ArrowIcon class="rotate w-[15px] h-[15px]" />
		<div class="w-full calendar-grid">
			<div v-for="day in daysOfTheWeek">
				{{ day }}
			</div>
			<div v-for="day in monthArray">
				{{ day }}
			</div>
		</div>
	</div>
</template>
<style scoped>
.calendar-grid {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	grid-template-rows: auto;
	grid-auto-flow: row;
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

const today = new Date(2023, monthIndex.value);
const getDaysForMonth = computed((): number => {
	return new Date(today.getFullYear(), monthIndex.value + 1, 0).getDate();
});
const startOfTheMonthOffset = computed(() => {
	let date = new Date(today.getFullYear(), monthIndex.value, 1);
	return date.getDay();
});
const monthArray = computed(() => {
	let days = range(1, getDaysForMonth.value);
	for (let i = 0; i < startOfTheMonthOffset.value; i++) {
		days.splice(0, 0, " ");
	}
	return days;
});
</script>

<style scoped>
.rotate {
	transform: rotate(180deg);
}
</style>
