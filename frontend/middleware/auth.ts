export default defineNuxtRouteMiddleware((to, from) => {
	const auth = useAuth();
	console.log("auth status", auth);
	if (!auth.isLoggedIn.value) {
		return navigateTo("/login");
	}
});
