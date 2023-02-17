import { defineStore } from "pinia";
export const useTempLanguageStore = defineStore("tempLanguageStore", () => {
	const languageOffering = ref(Languages.English);
	const languageSeeking = ref(Languages.Mandarin);
	const setLanguageOffering = (lang: string) => {
		languageOffering.value = lang;
	};
	const setLanguageSeeking = (lang: string) => {
		languageSeeking.value = lang;
	};
	return {
		languageOffering,
		languageSeeking,
		setLanguageOffering,
		setLanguageSeeking,
	};
});
