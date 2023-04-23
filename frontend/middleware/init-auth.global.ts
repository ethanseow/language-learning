export default defineNuxtRouteMiddleware(async (to, from) => {
	if (process.server) {
		const sessions = useSessionStore();
		const auth = useAuth();
		const nuxtApp = useNuxtApp();
		await auth.initAuth();
		const upcomingSessions = await getSessions(
			nuxtApp.$firestore,
			false,
			auth.user.value.uid
		);
		const pastSessions = await getSessions(
			nuxtApp.$firestore,
			true,
			auth.user.value.uid
		);
		sessions.setPastSessions(pastSessions);
		sessions.setUpcomingSessions(upcomingSessions);
	}
});
