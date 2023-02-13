export interface Time {
	hours: number;
	minutes: number;
}
export const getFullWeekdayName = (date: Date) => {
	return `${date.toLocaleString("en-us", {
		weekday: "long",
	})}`;
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
export const toTimeString = (times: Time[]) => {
	return times.map((time) => {
		let hours = time.hours.toString();
		let minutes = time.minutes.toString();
		if (hours.length < 2) {
			hours = "0" + hours;
		}
		if (minutes.length < 2) {
			minutes = "0" + minutes;
		}
		return `${hours}:${minutes}`;
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
