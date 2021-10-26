import { Library } from "slicemachine-core/models/Library";

import type { StateManager } from "./StateManager";
import type { Router } from "./Router";

export const enum StateManagerStatus {
	Pending = "pending",
	Loaded = "loaded",
	Error = "error",
}

export type State = {
	data: Library[] | null;
	status: StateManagerStatus;
	error: Error | null;
};

export type RouteDefinition = {
	name: string;
	path: string;
	regex: RegExp;
};

export type ResolvedRoute = {
	params?: { [key: string]: string };
} & RouteDefinition;

export interface SliceCanvasData {
	stateManager: StateManager;
	state: State;
	router: Router;
	route: ResolvedRoute | null;
}
