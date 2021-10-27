import path from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
	/*
	 ** Shared Options
	 */
	plugins: [vue()],
	root: path.join(__dirname, "src"),
	publicDir: path.join(__dirname, "src", "static"),
	resolve: {
		alias: {
			"~": path.join(__dirname, "src"),
		},
	},

	/*
	 ** Server Options
	 */
	server: {
		host: process.env.APP_HOST || "localhost",
		port: parseInt(process.env.APP_PORT) || 4000,
	},

	/*
	 ** Build Options
	 */
	build: {
		outDir: path.join(__dirname, "dist"),
	},
});
