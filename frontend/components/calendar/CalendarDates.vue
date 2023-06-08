<template>
	<div
		class="bg-gray-200 text-black m-auto h-[500px] w-[675px] justify-center p-8 flex flex-row items-center"
	>
		<div class="flex flex-col items-center p-2 grow shrink basis-0">
			<div class="text-center">
				Time Zone
				<div class="font-bold text-blue-700">
					{{ Intl.DateTimeFormat().resolvedOptions().timeZone }}
				</div>
			</div>
			<div class="flex flex-row justify-evenly w-full">
				<div class="font-bold text-lg">{{ month }} {{ year }}</div>
				<div class="flex flex-row gap-8 h-max my-auto">
					<ArrowIcon @click="changeMonth(-1)" class="arrow" />
					<ArrowIcon @click="changeMonth(1)" class="rotate arrow" />
				</div>
			</div>
			<div class="calendar-grid">
				<div v-for="day in daysOfTheWeek">
					{{ day }}
				</div>
				<div v-for="day in monthArray" class="calendar-cell">
					<div
						:class="showAvailableCells(day)"
						@click="setChosenDay(day)"
					>
						{{ day }}
					</div>
				</div>
			</div>
			<br />
			<ChooseLanguage />
		</div>
		<div class="grow shrink h-full basis-0 p-3">
			<AppointmentTimes
				:times="times"
				:chosen-day-string="chosenDayString"
				:chosen-day="chosenDay"
			/>
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
	text-align: center;
	background-color: #bad3df;
	color: #1d4ed8;
	border-width: 2px;
	border-radius: 100%;
	line-height: 27px;
	height: 30px;
	width: 30px;
}
.rotate {
	transform: rotate(180deg);
}
</style>

<script setup lang="ts">
import { useCalendarStore } from "~~/stores/calendar";

const today = new Date();
today.setUTCHours(today.getUTCHours() + 24 * 2);
const monthIndex = ref(today.getUTCMonth());
const year = ref(today.getUTCFullYear());
const chosenDay = ref(
	new Date(year.value, monthIndex.value, today.getUTCDate())
);
const calendar = useCalendarStore();
const times = computed(() => {
	return calendar.availableTimes;
});
const setChosenDay = (day: number) => {
	const newDate = new Date(year.value, monthIndex.value, day);
	console.log("chosen date", newDate);
	if (today.getTime() < newDate.getTime()) {
		chosenDay.value = new Date(year.value, monthIndex.value, day);
	}
};

const month = computed(() => {
	return months[monthIndex.value];
});
const chosenDayString = computed(() => {
	return `${chosenDay.value.toLocaleString("en-us", {
		weekday: "long",
	})}, ${
		months[chosenDay.value.getUTCMonth()]
	} ${chosenDay.value.getUTCDate()}`;
});
const changeMonth = (v: number) => {
	if (monthIndex.value + v < today.getUTCMonth()) {
		return;
	}
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

const getDaysForMonth = computed((): number => {
	return new Date(year.value, monthIndex.value + 1, 0).getUTCDate();
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
	const currentDate = new Date(year.value, monthIndex.value, day);
	const roundedDayDown = new Date(
		today.getUTCFullYear(),
		today.getUTCMonth(),
		today.getUTCDate()
	);
	if (day == " " || currentDate.getTime() < roundedDayDown.getTime()) {
		return "";
	}
	return "available-day";
};
</script>
