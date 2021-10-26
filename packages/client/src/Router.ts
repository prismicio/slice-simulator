import { EventEmitter } from "./lib/EventEmitter";
import { ResolvedRoute, RouteDefinition } from "./types";

export type RouterEvents = {
	routeResolved: ResolvedRoute;
};

export class Router extends EventEmitter<RouterEvents> {
	public static fourOFour: RouteDefinition = {
		name: "404",
		path: "[...any]",
		regex: /^.*$/i,
	};

	public routes: RouteDefinition[];
	public route: ResolvedRoute | null = null;

	private _watching = false;

	constructor(routes: RouteDefinition[]) {
		super();

		this.routes = routes;
	}

	watch(): void {
		if (!this._watching) {
			this._watching = true;

			if (!window.location.hash) {
				window.location.hash = "/";
			}

			window.addEventListener("hashchange", this.resolveRoute.bind(this));
			this.resolveRoute();
		}
	}

	unwatch(): void {
		if (this._watching) {
			this._watching = false;
			window.removeEventListener("hashchange", this.resolveRoute.bind(this));
		}
	}

	resolveRoute(): void {
		const path = window.location.hash.replace(/^#/, "");

		for (const route of this.routes) {
			const match = path.match(route.regex);

			if (match) {
				this.route = {
					...route,
					params: match.groups,
				};
				this.emit("routeResolved", this.route);

				return;
			}
		}

		this.route = Router.fourOFour;
		this.emit("routeResolved", this.route);
	}
}
