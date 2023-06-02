export default defineNuxtRouteMiddleware(async (to, from) => {
	function isLanguage(str: string): boolean {
		//@ts-ignore
		return Object.values(Languages).includes(str);
	}
	const auth = useAuth();
	const nuxtApp = useNuxtApp();
	const offering: string = "" + to.query?.offering;
	const seeking: string = "" + to.query?.seeking;
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
	const rightNow = roundDownToHalfHour(new Date());
	const session = await userHasSession(
		nuxtApp.$firestore,
		// @ts-ignore
		auth.user.value.uid,
		offering,
		seeking,
		rightNow
	);
	//  uncomment to enable session time check
	/*
	if (!session) {
		return createError({
			statusCode: 404,
			statusMessage: "Meeting time is incorrect",
		});
	}
    */
});
