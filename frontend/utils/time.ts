export interface Time {
	hours: number;
	minutes: number;
}
export const getFullWeekdayName = (date: Date) => {
	return `${date.toLocaleString("en-us", {
		weekday: "long",
	})}`;
};

export const getStringDateFormat = (date: Date) => {
	return `${date.toLocaleString("en-us", {
		weekday: "long",
	})}, ${months[date.getMonth()]} ${date.getDate()}`;
};
export const daysOfTheWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
export const months = [
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
export const getDigits = (num: number) => {
	return num.toString().length;
};
export const toTimeString = (time: Time) => {
	let hours = time.hours.toString();
	let minutes = time.minutes.toString();
	if (hours.length < 2) {
		hours = "0" + hours;
	}
	if (minutes.length < 2) {
		minutes = "0" + minutes;
	}
	return `${hours}:${minutes}`;
};
export const toTimeStrings = (times: Time[]) => {
	return times.map((time) => {
		toTimeString(time);
	});
};

export const toAMPM = (times: Time[]) => {
	return times.map((time) => {
		if (time.hours == 0) {
			return {
				hours: 12,
				minutes: time.minutes,
			};
		} else if (time.hours >= 12) {
			return { hours: time.hours % 12, minutes: time.minutes };
		}
	});
};
export function sameUTCDate(d1: Date, d2: Date) {
	return (
		d1.getUTCFullYear() === d2.getUTCFullYear() &&
		d1.getUTCMonth() === d2.getUTCMonth() &&
		d1.getUTCDate() === d2.getUTCDate()
	);
}

export const generateTimes = (totalHours: number, minuteInterval: number) => {
	const times: Time[] = [];
	for (let i = 0; i < totalHours; i++) {
		for (let j = 0; j < 60; j += minuteInterval) {
			times.push({
				hours: i,
				minutes: j,
			});
		}
	}
	return times;
};

export const timesGreaterThanXSec = (time1: Date, time2: Date, X: number) => {
	const sec1 = time1.getTime() / 1000;
	const sec2 = time2.getTime() / 1000;
	return Math.abs(sec1 - sec2) > X;
};
export const roundDayDown = (date: Date) => {
	return new Date(
		date.getUTCFullYear(),
		date.getUTCMonth(),
		date.getUTCDate()
	);
};

export const roundHourDown = (date: Date) => {
	return new Date(
		date.getUTCFullYear(),
		date.getUTCMonth(),
		date.getUTCDate(),
		date.getUTCHours(),
		0
	);
};

export function roundDownToHalfHour(date: Date) {
	var roundedDate = new Date(date); // Create a new Date object with the same value as the input date

	roundedDate.setMilliseconds(0);
	roundedDate.setSeconds(0);

	var minutes = roundedDate.getMinutes();
	if (minutes > 30) {
		roundedDate.setMinutes(30); // Round down to the previous half-hour
	} else {
		roundedDate.setMinutes(0); // Round down to the current hour
	}

	return roundedDate;
}

export const getDayBefore = (date: Date) => {
	var today = new Date();
	var yesterday = new Date(today);

	// check if today is the first day of the year
	if (today.getMonth() === 0 && today.getDate() === 1) {
		// set yesterday's date to be December 31st of the previous year
		yesterday.setFullYear(today.getFullYear() - 1);
		yesterday.setMonth(11); // set month to December (11)
		yesterday.setDate(31); // set day to 31
	} else if (today.getDate() === 1) {
		// check if today is the first day of the month
		// set yesterday's date to be the last day of the previous month
		yesterday.setMonth(today.getMonth() - 1);
		yesterday.setDate(
			new Date(
				yesterday.getFullYear(),
				yesterday.getMonth() + 1,
				0
			).getDate()
		);
	} else {
		// set yesterday's date to be one day less than today's date
		yesterday.setDate(today.getDate() - 1);
	}

	return yesterday;
};

export function formatDate(date: Date) {
	const monthNames = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];

	const month = monthNames[date.getMonth()];
	const day = date.getDate();
	const year = date.getFullYear();
	const hours = date.getHours();
	const minutes = date.getMinutes();
	const ampm = hours >= 12 ? "PM" : "AM";

	const formattedTime = hours % 12 === 0 ? 12 : hours % 12;
	const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

	const formattedDate = `${month} ${day}, ${year} ${formattedTime}:${formattedMinutes} ${ampm}`;
	return formattedDate;
}
