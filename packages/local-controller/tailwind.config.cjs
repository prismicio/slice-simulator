module.exports = {
	mode: "jit",
	prefix: "",
	important: false,
	separator: ":",
	purge: ["./src/**/*.{html,vue,js,ts,jsx,tsx}"],
	darkMode: "class",
	theme: {
		fontFamily: {
			sans: [
				"IBM Plex Sans",
				"-apple-system",
				"BlinkMacSystemFont",
				'"Segoe UI"',
				"Helvetica",
				"Arial",
				"sans-serif",
				'"Apple Color Emoji"',
				'"Segoe UI Emoji"',
				'"Segoe UI Symbol"',
			],
		},
		colors: {
			transparent: "transparent",
			current: "currentColor",
			inherit: "inherit",
			black: {
				DEFAULT: "#25252d",
				400: "#25252d",
				300: "#4e4e55",
			},
			white: {
				DEFAULT: "#fefefe",
				400: "#fefefe",
			},
			gray: {
				DEFAULT: "#e6e6ea",
				600: "#667587",
				400: "#e6e6ea",
				200: "#f1f1f4",
			},
		},
		extend: {
			opacity: {
				inherit: "inherit",
			},
			spacing: {
				inherit: "inherit",
			},
			minWidth: {
				inherit: "inherit",
			},
			maxWidth: {
				inherit: "inherit",
			},
			minHeight: {
				inherit: "inherit",
			},
			maxHeight: {
				inherit: "inherit",
			},
			lineHeight: {
				0: 0,
			},
		},
	},
	plugins: [
		({ addBase, theme }) => {
			addBase({
				strong: { fontWeight: theme("fontWeight.bold") },
				small: { fontSize: "inherit" },
				"label, input, textarea, select": {
					display: "block",
					fontWeight: "inherit",
					fontStyle: "inherit",
				},
			});
		},
	],
};
