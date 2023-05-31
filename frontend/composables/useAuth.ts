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
import jwt_decode from "jwt-decode";

export const useAuth = () => {
	const auth: Auth = useNuxtApp().$auth;
	const error = ref({
		hasError: false,
		message: "",
	});
	const isLoggedIn = useState("isLoggedIn", () => false);
	//@ts-ignore
	const user: Ref<User | null> = useState("user", () => {});
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
			.then((res) => {})
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
			console.log("signIn - user", user.value);
			createCookie(token);
			isLoggedIn.value = true;
			if (user.value) {
				useSessionStore().retrieveAllSessions(user.value);
				navigateTo(urlConsts.DASHBOARD);
			}
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
		axios
			.post(apiUrl + "/api/logout", {}, { withCredentials: true })
			.then((res) => {
				user.value = null;
				isLoggedIn.value = false;
				const session = useSessionStore();
				session.setPastSessions([]);
				session.setUpcomingSessions([]);
				navigateTo("/");
			});
	}

	const initAuth = async () => {
		const authCookie = useCookie("authCookie");
		if (authCookie.value) {
			const decoded = jwt_decode(authCookie.value);
			//@ts-ignore
			const uid: string = decoded.user_id;
			const fbUser = await getUser(uid);
			user.value = fbUser;
			isLoggedIn.value = true;
		}
	};
	const signInWithGoogle = () => signIn(new GoogleAuthProvider());
	return {
		isLoggedIn,
		user,
		error,
		signInWithGoogle,
		logout,
		initAuth,
	};
};
