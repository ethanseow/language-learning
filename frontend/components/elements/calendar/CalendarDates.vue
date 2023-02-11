<template>
	<div class="bg-black m-auto mt h-2/3 w-1/2 justify-center">
		<div>{{ month }} {{ today.getFullYear() }}</div>
		<ArrowIcon class="rotate w-[15px] h-[15px]" />
		<table class="w-full">
			<tr>
				<th class="text-white" v-for="day in daysOfTheWeek">
					{{ day }}
				</th>
			</tr>
			<tr>
				<td :colspan="startOfTheMonth"></td>
				<td v-for="i in monthArray[0]">
					{{ i }}
				</td>
			</tr>
			<tr v-for="i in range(1, monthArray.length)">
				<td v-for="j in monthArray[i]">
					{{ j }}
				</td>
			</tr>
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

const today = new Date(2026, monthIndex.value);
const getDaysForMonth = (year: number, month: number): number => {
	month += 1;
	return new Date(year, month, 0).getDate();
};
const startOfTheMonth = computed(() => {
	let date = new Date(today.getFullYear(), monthIndex.value, 1);
	return date.getDay();
});
const endOfTheMonthOffset = computed(() => {
	let daysInTheMonth = getDaysForMonth(today.getFullYear(), monthIndex.value);
	let date = new Date(today.getFullYear(), monthIndex.value, daysInTheMonth);
	return date.getDay() + 1;
});
const startOfMonthOffset = computed(() => 7 - startOfTheMonth.value);
const numberOfWeeks = computed(() => {
	const days =
		getDaysForMonth(today.getFullYear(), monthIndex.value) -
		startOfMonthOffset.value -
		endOfTheMonthOffset.value;
	return days / 7;
});
const monthArray = computed(() => {
	const startOfMonthWeek = range(1, startOfMonthOffset.value + 1);
	const endOfMonthWeek = range(
		1 + numberOfWeeks.value * 7 + startOfMonthOffset.value,
		1 +
			numberOfWeeks.value * 7 +
			startOfMonthOffset.value +
			endOfTheMonthOffset.value
	);
	console.log(numberOfWeeks.value);
	const middleWeeks = range(0, numberOfWeeks.value).map((week) => {
		return range(
			week * 7 + startOfMonthOffset.value + 1,
			week * 7 + startOfMonthOffset.value + 1 + 7
		);
	});
	return [startOfMonthWeek, ...middleWeeks, endOfMonthWeek];
});
console.log(monthArray.value);
// new Date(year, monthIndex, day)
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
