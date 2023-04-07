module.exports = {
	content: [
		"./components/**/*.{js,vue,ts}",
		"./layouts/**/*.vue",
		"./pages/**/*.vue",
		"./plugins/**/*.{js,ts}",
		"./nuxt.config.{js,ts}",
		"./app.vue",
	],
	theme: {
		fontFamily: {
			inter: ["Inter", "sans-serif"],
		},
		extend: {
			colors: {
				primary: "#FFFFFF",
				secondary: "#899BFB",
				tertiary: "#b5c0fc",
				background: "#242424",
				backgroundSecondary: "#525252",
			},
		},
	},
	plugins: [],
};
