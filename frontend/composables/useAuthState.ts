import { Auth } from "firebase/auth";

export const useAuthState = () => {
	const username = ref();

	/*
	const isLoggedIn = computed(
		() => username.value != "" && username != null && username != undefined
	);
    */

	const isLoggedIn = ref(false);
	const currentUser = ref();

	const auth: Auth = useNuxtApp().$auth;
	console.log("this is auth", auth);
	onMounted(() => {
		auth.onAuthStateChanged(function (user) {
			if (user) {
				//@ts-ignore
				isLoggedIn.value = true;
				currentUser.value = user;
				console.log("got user");
				username.value = user.displayName?.split(" ")?.[0];
			} else {
				username.value = "";
			}
		});
	});

	const signOut = () => {
		auth.signOut();
		username.value = null;
	};

	return {
		isLoggedIn,
		currentUser,
		username,
		auth,
		signOut,
	};
};
