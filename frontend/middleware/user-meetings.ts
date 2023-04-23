export default defineNuxtRouteMiddleware((to, from) => {
	function isLanguage(str: string): boolean {
		return Object.values(Languages).includes(str);
	}
	const auth = useAuth();
	const rightNow = roundHourDown(new Date());
	const offering = to.query?.offering;
	const seeking = to.query?.seeking;
	if (!offering || !seeking) {
		return createError({
			statusCode: 404,
			statusMessage: "No offering/seeking combination",
		});
	}
	if (!isLanguage(offering) || !isLanguage(seeking)) {
		return createError({
			statusCode: 404,
			statusMessage: "Not a valid offering/seeking",
		});
	}
});
