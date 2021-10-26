import { RouteDefinition } from "./types";
import { Router } from "./Router";

export const routes: RouteDefinition[] = [
	{
		name: "preview",
		path: "/preview/[libraries]/[slice]/[variation]",
		regex:
			/^\/preview\/(?<libraries>[^\/]+)\/(?<slice>[^\/]+)\/(?<variation>[^\/]+)\/?$/i,
	},
	{
		name: "playground",
		path: "/playground",
		regex: /^\/playground\/?$/i,
	},
	{
		name: "hub",
		path: "/",
		regex: /^\/?$/i,
	},
];

export const createRouter = (): Router => {
	return new Router(routes);
};
