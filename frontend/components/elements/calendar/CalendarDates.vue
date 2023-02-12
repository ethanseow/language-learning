<template>
	<div
		class="bg-black m-auto mt h-3/4 w-2/3 justify-center p-8 flex flex-row items-center"
	>
		<div class="flex flex-col items-center p-2 grow shrink basis-0">
			<div class="flex flex-row justify-evenly w-full">
				<div>{{ month }} {{ year }}</div>
				<div class="flex flex-row gap-8">
					<ArrowIcon @click="changeMonth(-1)" class="arrow" />
					<ArrowIcon @click="changeMonth(1)" class="rotate arrow" />
				</div>
			</div>
			<div class="calendar-grid">
				<div v-for="day in daysOfTheWeek">
					{{ day }}
				</div>
				<div v-for="day in monthArray" class="calendar-cell">
					<div :class="showAvailableCells(day)">
						{{ day }}
					</div>
				</div>
			</div>
			<div>Time Zone EST</div>
		</div>
		<div class="grow shrink bg-white h-full basis-0 p-3">
			<div
				class="w-full flex flex-col justify-center items-center text-black h-full gap-5"
			>
				<div>Tuesday, February 14</div>
				<div class="overflow-y-auto w-full flex flex-col items-center">
					<div
						v-for="time in toTimeString(calendar.availableTimes)"
						class="text-center p-4 border-backgroundSecondary border-2 mb-2 rounded-md w-1/2"
					>
						{{ time }}
					</div>
				</div>
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
	width: 350px;
	height: 300px;
	display: grid;
	grid-template-columns: repeat(7, 50px);
	grid-auto-rows: 50px;
	grid-auto-flow: row;
	justify-items: center;
	align-items: center;
}
.calendar-header {
	grid-column: span 7;
	grid-row: span 1;
}
.calendar-cell {
	padding: auto;
}
.available-day {
	background-color: thistle;
	text-align: center;
	border-radius: 100%;
	line-height: 30px;
	height: 30px;
	width: 30px;
}
</style>

<script setup lang="ts">
import { useCalendarStore } from "~~/stores/calendar";
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
const today = new Date();
const changeMonth = (v: number) => {
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

const showAvailableCells = (day: any) => {
	if (day == " " || day <= today.getDate()) {
		return "";
	}
	return "available-day";
};
const calendar = useCalendarStore();
</script>

<style scoped>
.rotate {
	transform: rotate(180deg);
}
</style>
