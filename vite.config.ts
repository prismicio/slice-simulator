import { defineConfig } from "vite";
import sdk from "vite-plugin-sdk";

export default defineConfig({
	plugins: [sdk()],
	build: {
		lib: {
			entry: {
				index: "./src/index.ts",
				kit: "./src/kit/index.ts",
			},
		},
	},
	test: {
		environment: "jsdom",
		coverage: {
			reporter: ["lcovonly", "text"],
		},
		setupFiles: ["./test/__setup__.ts"],
	},
});
