// nuxt.config.js
export default defineNuxtConfig({
	// ... other options
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
