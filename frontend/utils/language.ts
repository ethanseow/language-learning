export const getImageFromLang = (lang: string) => {
	let fileName = "";
	switch (lang) {
		case Languages.English:
			fileName = "congress.jpg";
			break;
		case Languages.French:
			fileName = "paris.jpg";
			break;
		case Languages.Japanese:
			fileName = "fuji.jpg";
			break;
		case Languages.Mandarin:
			fileName = "beijing.jpg";
			break;
		case Languages.Spanish:
			fileName = "madrid.jpg";
			break;
		default:
	}
	return new URL(`/assets/images/${fileName}`, import.meta.url).href;
};
