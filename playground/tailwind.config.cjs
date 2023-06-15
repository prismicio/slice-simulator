const path = require("path");

module.exports = {
	content: [
		path.join(__dirname, "./src/pages/**/*.{js,ts,jsx,tsx,mdx}"),
		path.join(__dirname, "./src/components/**/*.{js,ts,jsx,tsx,mdx}"),
		path.join(__dirname, "./src/app/**/*.{js,ts,jsx,tsx,mdx}"),
		path.join(__dirname, "./src/slices/**/*.{js,ts,jsx,tsx,mdx}"),
	],
};
