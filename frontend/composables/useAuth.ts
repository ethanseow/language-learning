import axios from "axios";
import {
	signInWithPopup,
	GoogleAuthProvider,
	AuthProvider,
	Auth,
} from "firebase/auth";
import { Ref } from "nuxt/dist/app/compat/capi";
import { createOrGetUser, getUser } from "~~/utils/firebase";
import { type User } from "~~/utils/firebase";

export const useAuth = () => {
	const auth: Auth = useNuxtApp().$auth;
	const error = ref({
		hasError: false,
		message: "",
	});
	const user: Ref<User | null> = ref(null);
	const apiUrl = useRuntimeConfig().public.apiBase;
	const createCookie = (token: string) => {
		axios
			.post(
				apiUrl + "/api/login",
				{
					token,
				},
				{
					withCredentials: true,
				}
			)
			.then((res) => {
				console.log(res);
				if (res.status == 200) {
					navigateTo(urlConsts.DASHBOARD);
				}
			})
			.catch((err) => {
				console.log(err);
				error.value = {
					hasError: true,
					message: "Invalid Login",
				};
			});
	};

	const signIn = async (provider: AuthProvider) => {
		try {
			const result = await signInWithPopup(auth, provider);
			const token = await result.user.getIdToken();
			user.value = await createOrGetUser(result.user);
			createCookie(token);
		} catch (e) {
			console.log(e);
			error.value = {
				hasError: true,
				message: "Invalid Login",
			};
		}
	};

	function logout() {
		auth.signOut().then(() => {});
		axios.post(apiUrl + "/api/logout", {}).then((res) => {
			console.log(res);
		});
	}
	onMounted(() => {
		auth.onAuthStateChanged(async (newUser) => {
			if (newUser != null) {
				user.value = await getUser(newUser.uid);
			} else {
				user.value = null;
			}
		});
	});

	const signInWithGoogle = () => signIn(new GoogleAuthProvider());
	return {
		user,
		error,
		signInWithGoogle,
		logout,
	};
};
