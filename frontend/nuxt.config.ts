// nuxt.config.js
export default defineNuxtConfig({
	// ... other options
	imports: {
		dirs: ["stores"],
	},
	modules: [
		// ...
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
});
