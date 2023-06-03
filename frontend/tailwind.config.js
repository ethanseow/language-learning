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
		screens: {
			"2xl": { max: "1535px" },
			xl: { max: "1279px" },
			lg: { max: "1023px" },
			md: { max: "767px" },
			sm: { max: "639px" },
		},
		container: {
			center: true,
			padding: "2rem",
		},
		fontFamily: {
			inter: ["Inter", "sans-serif"],
		},
		extend: {
			colors: {
				primary: "#FFFFFF",
				secondary: "#899BFB",
				tertiary: "#b5c0fc",
				background: "#2D3047",
				backgroundSecondary: "#525252",
			},
		},
	},
	plugins: [],
};
