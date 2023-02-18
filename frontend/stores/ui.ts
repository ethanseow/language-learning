import { defineStore } from "pinia";
import { type Ref } from "vue";
import { Time } from "~~/utils/time";
export enum CalendarFlow {
	CalendarOverlay = "CalendarAppointments",
	ThankYouSignupOverlay = "ThankYouSignup",
}

export interface CalendarFlowProps {
	appointmentDate: Date;
	languageOffering: string;
	languageSeeking: string;
}
const tempCalendarFlowProps = {
	appointmentDate: new Date(1, 15),
	languageOffering: Languages.English,
	languageSeeking: Languages.Mandarin,
};

export const useCalenderUIStore = defineStore("calendarUIStore", () => {
	const showCalendar = ref(false);
	const setCalendar = (bool: boolean) => {
		console.log(`setting calendar to ${bool}`);
		showCalendar.value = bool;
	};
	return { showCalendar, setCalendar };
});
export const useCalendarUIFlowStore = defineStore("calendarFlowUiStore", () => {
	const calendarFlowState = ref(CalendarFlow.ThankYouSignupOverlay);
	const tempData: Ref<CalendarFlowProps> = ref({
		...tempCalendarFlowProps,
	});
	const setCalendarFlowState = (flow: CalendarFlow) => {
		calendarFlowState.value = flow;
	};
	const setTempData = (temp: CalendarFlowProps) => {
		tempData.value = temp;
	};
	return { calendarFlowState, setCalendarFlowState, tempData, setTempData };
});

export const resetCalendarUi = () => {
	const { setCalendarFlowState, setTempData } = useCalendarUIFlowStore();
	const { setCalendar } = useCalenderUIStore();
	setCalendar(false);
	setTempData({
		...tempCalendarFlowProps,
	});
	setCalendarFlowState(CalendarFlow.CalendarOverlay);
};
