// nuxt.config.js
export default defineNuxtConfig({
	// ... other options
	css: ["~/assets/css/main.css"],
	postcss: {
		plugins: {
			tailwindcss: {},
			autoprefixer: {},
		},
	},
	imports: {
		dirs: ["stores", "assets/logos", "constants"],
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
			path: "~/components/portions",
			pathPrefix: true,
		},
		{
			path: "~/components/",
			pathPrefix: false,
		},
	],
});
