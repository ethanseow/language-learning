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
	const user: Ref<User> = useState("user", () => {});
	//const isLoggedIn = ref(false);
	//const user = ref();
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
			createCookie(token);
			isLoggedIn.value = true;
			navigateTo(urlConsts.DASHBOARD);
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

	onMounted(() => {
		const hello = useState("log");
		const world = useState("user");
		const state = useState("state");
		console.log("client side isLoggedIn", hello.value);
		console.log("client side user", world.value);
		console.log("this is the state on the auth side", state.value);
		/*
		auth.onAuthStateChanged(async (newUser) => {
			if (newUser != null) {
				user.value = await getUser(newUser.uid);
				isLoggedIn.value = true;
			} else {
				user.value = null;
				isLoggedIn.value = false;
			}
		});
        */
	});

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
