export type RouteDefinition = {
	name: string;
	path: string;
	regex: RegExp;
};

export type ResolvedRoute = {
	params?: { [key: string]: string };
} & RouteDefinition;

export const createRouter = (): Router => {
	return new Router();
};

export class Router {
	private static routes: RouteDefinition[] = [
		{
			name: "single",
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

	private static fourOFour: RouteDefinition = {
		name: "404",
		path: "[...any]",
		regex: /^.*$/i,
	};

	private watching = false;
	private watcher: () => void = () => undefined;

	watch(callback: (route: ResolvedRoute) => void): void {
		if (!this.watching) {
			this.watching = true;

			if (!window.location.hash) {
				window.location.hash = "/";
			}

			this.watcher = () => {
				this.resolveRoute(callback);
			};

			window.addEventListener("hashchange", this.watcher);
			this.watcher();
		}
	}

	unwatch(): void {
		if (this.watching) {
			this.watching = false;
			window.removeEventListener("hashchange", this.watcher);
		}
	}

	resolveRoute(callback: (route: ResolvedRoute) => void): void {
		const path = window.location.hash.replace(/^#/, "");

		for (const route of Router.routes) {
			const match = path.match(route.regex);

			if (match) {
				callback({
					...route,
					params: match.groups,
				});

				return;
			}
		}

		callback(Router.fourOFour);
	}
}
