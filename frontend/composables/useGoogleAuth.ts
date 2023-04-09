import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
export const useGoogleAuth = () => {
	const provider = new GoogleAuthProvider();
	const auth = getAuth();
	const error = ref();
	const user = ref();

	const signInWithGoogle = async () => {
		try {
			const result = await signInWithPopup(auth, provider);
			user.value = result.user;
			localStorage.setItem(
				authConsts.localStorageUsername,
				"" + result.user.displayName?.split("")?.[0]
			);
		} catch (e) {
			error.value = e;
		}
	};
	return {
		user,
		error,
		signInWithGoogle,
	};
};
