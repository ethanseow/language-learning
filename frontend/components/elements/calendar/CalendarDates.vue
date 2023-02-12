<template>
	<div class="bg-black m-auto mt h-2/3 w-1/2 justify-center p-4">
		<!---
		<div class="flex flex-row justify-between w-full">
			<div>{{ month }} {{ year }}</div>
			<div class="flex flex-row">
				<ArrowIcon @click="changeMonth(-1)" class="arrow" />
				<ArrowIcon @click="changeMonth(1)" class="rotate arrow" />
			</div>
		</div>
        --->
		<div class="w-full calendar-grid">
			<div class="calendar-header flex flex-row justify-evenly w-full">
				<div>{{ month }} {{ year }}</div>
				<div class="flex flex-row gap-8">
					<ArrowIcon @click="changeMonth(-1)" class="arrow" />
					<ArrowIcon @click="changeMonth(1)" class="rotate arrow" />
				</div>
			</div>
			<div v-for="day in daysOfTheWeek" class="calendar-cell">
				{{ day }}
			</div>
			<div v-for="day in monthArray" class="calendar-cell">
				{{ day }}
			</div>
		</div>
	</div>
</template>
<style scoped>
.arrow {
	width: 15px;
	height: 15px;
}
.calendar-grid {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	grid-template-rows: auto;
	grid-auto-flow: row;
	justify-items: center;
}
.calendar-header {
	grid-column: span 7;
	grid-row: span 1;
}
.calendar-cell {
	padding: 1rem;
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
const year = ref(2023);
const changeMonth = (v) => {
	monthIndex.value = monthIndex.value + v;
	if (monthIndex.value == 12) {
		monthIndex.value = 0;
		year.value = year.value + v;
		return;
	}
	if (monthIndex.value == -1) {
		monthIndex.value = 11;
		year.value = year.value + v;
		return;
	}
};
const month = computed(() => {
	return months[monthIndex.value];
});
const getDaysForMonth = computed((): number => {
	return new Date(year.value, monthIndex.value + 1, 0).getDate();
});
const startOfTheMonthOffset = computed(() => {
	let date = new Date(year.value, monthIndex.value, 1);
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
