import { Auth } from "firebase/auth";

export const useAuthState = () => {
	const username = ref(localStorage.getItem(authConsts.localStorageUsername));

	const isLoggedIn = computed(
		() => username.value != "" && username != null && username != undefined
	);

	const auth: Auth = useNuxtApp().$auth;
	auth.onAuthStateChanged(function (user) {
		if (user) {
			//@ts-ignore
			username.value = user.displayName?.split(" ")?.[0];
		} else {
			username.value = "";
		}
	});

	const signOut = () => {
		auth.signOut();
		localStorage.removeItem(authConsts.localStorageUsername);
		username.value = null;
	};

	return {
		isLoggedIn,
		username,
		auth,
		signOut,
	};
};
