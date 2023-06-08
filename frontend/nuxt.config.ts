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
		[
			"@nuxtjs/i18n",
			{
				//vueI18n: "./i18n.config.ts",

				detectBrowserLanguage: {
					useCookie: true,
					cookieKey: "i18n_redirected",
					//redirectOn: "root",
					alwaysRedirect: true,
				},
				locales: [
					{
						code: "en",
						name: "English",
						// lazy loading order: `es.json` -> `es-AR.json`, and then merge 'es-AR.json' to 'es.json'
						files: ["en.ts"],
					},
					{
						code: "zh",
						name: "Mandarin",
						files: ["zh.ts"],
					},
				],
				lazy: true,
				langDir: "lang",
				defaultLocale: "en",
			},
		],
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
	components: [
		{
			path: "~/components/",
			pathPrefix: false,
		},
	],
});
