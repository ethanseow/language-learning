import datetimeFormats from "@/lang/datetime";
import messages from "@/lang/messages";
export default defineI18nConfig(() => {
	return {
		legacy: false,
		datetimeFormats,
		messages,
	};
});
