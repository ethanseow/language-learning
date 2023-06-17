// nuxt.config.js
export default defineNuxtConfig({
	// ... other options
	ssr: true,
	css: ["~/assets/css/main.css"],
	runtimeConfig: {
		public: {
			apiKey: "",
			authDomain: "",
			projectId: "",
			storageBucket: "",
			messagingSenderId: "",
			appId: "",
			measurementId: "",
			apiBase: "",
		},
	},
	postcss: {
		plugins: {
			tailwindcss: {},
			autoprefixer: {},
		},
	},
	imports: {
		dirs: ["stores", "assets/logos", "constants", "utils", "composables"],
	},
	modules: [
		// ...
		"@nuxtjs/tailwindcss",
		["@nuxtjs/i18n"],
		[
			"@pinia/nuxt",
			{
				autoImports: [
					// automatically imports `defineStore`
					"defineStore", // import { defineStore } from 'pinia'
					// automatically imports `defineStore` as `definePiniaStore`
					["defineStore", "definePiniaStore"], // import { defineStore as definePiniaStore } from 'pinia'
				],
			},
		],
	],
	i18n: {
		detectBrowserLanguage: {
			useCookie: true,
			cookieKey: "i18n_redirected",
			alwaysRedirect: true,
		},

		locales: [
			{
				code: "en-US",
				name: "English",
			},
			{
				code: "zh-CN",
				name: "简体中文",
			},
			{
				code: "es-ES",
				name: "Español",
			},
			{
				code: "fr-FR",
				name: "Français",
			},
			{
				code: "ja-JP",
				name: "日本語",
			},
		],

		defaultLocale: "en-US",
		vueI18n: "./lang/i18n-config.ts", // if you are using custom path, default
	},
	components: [
		{
			path: "~/components/",
			pathPrefix: false,
		},
	],
});
