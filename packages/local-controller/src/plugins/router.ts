import { createRouter, createWebHistory } from "vue-router";

export const router = createRouter({
	history: createWebHistory(),
	routes: [
		{
			path: "/",
			name: "Index",
			component: () =>
				import(/* webpackChunkName: "index" */ "../pages/index.vue"),
		},
	],
});
