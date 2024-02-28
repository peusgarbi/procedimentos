/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{html,js,svelte,ts}"],
	theme: {
		extend: {},
	},
	plugins: [require("@tailwindcss/typography"), require("daisyui")],
	daisyui: {
		themes: false,
		darkTheme: "dark",
		base: true,
		styled: true,
		utils: true,
		prefix: "daisy-",
		logs: false,
		themeRoot: ":root",
	},
};
