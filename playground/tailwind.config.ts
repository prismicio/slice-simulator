import type { Config } from "tailwindcss";

const config: Partial<Config> = {
	content: [
		"./slices/**/*.{js,ts,vue}",
		"./playground/slices/**/*.{js,ts,vue}",
	],
};

export default config;
