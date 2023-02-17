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
	return `/img/${fileName}`;
};

export const getFlagFromLang = (lang: string) => {
	let fileName = "";
	switch (lang) {
		case Languages.English:
			fileName = "america.jpg";
			break;
		case Languages.French:
			fileName = "france.png";
			break;
		case Languages.Japanese:
			fileName = "japan.png";
			break;
		case Languages.Mandarin:
			fileName = "china.png";
			break;
		case Languages.Spanish:
			fileName = "spain.png";
			break;
		default:
	}
	return `/img/flags/${fileName}`;
};
