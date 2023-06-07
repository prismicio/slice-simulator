import { repositoryName as endpoint } from "./slicemachine.config.json";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	modules: ["@nuxtjs/prismic", "@nuxtjs/tailwindcss"],

	prismic: { endpoint },

	tailwindcss: {
		cssPath: "~/assets/style.css",
	},
});
