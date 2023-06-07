import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
	content: [
		"./slices/**/*.{js,ts,vue}",
		"./playground/slices/**/*.{js,ts,vue}"
	]
};
