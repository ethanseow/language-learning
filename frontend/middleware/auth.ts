export default defineNuxtRouteMiddleware((to, from) => {
	const auth = useAuth();
	if (auth.isLoggedIn.value == false) {
		return navigateTo("/login");
	}
});
