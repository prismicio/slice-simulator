import { defineConfig } from "vitest/config"

export default defineConfig({
	test: {
		environment: "jsdom",
		typecheck: {
			enabled: true,
		},
		coverage: {
			provider: "v8",
			reporter: ["lcovonly", "text"],
			include: ["src"],
		},
	},
})
