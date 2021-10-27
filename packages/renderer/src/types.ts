import { SliceZone } from "@prismicio/types";
import { Library } from "slicemachine-core/models/Library";

import type { StateManager } from "./StateManager";

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

export interface SliceCanvasProps {
	statePredicate:
		| (() => Promise<Library[] | { default: Library[] }>)
		| Promise<Library[] | { default: Library[] }>;
	zIndex: number;
}

export interface SliceCanvasData {
	stateManager: StateManager;
	state: State;
	slices: SliceZone;
}

export type SliceCanvasOptions = SliceCanvasProps & SliceCanvasData;

export type VariationSummary = {
	name: string;
	id: string;
};

export type SliceSummary = {
	name: string;
	id: string;
	variations: VariationSummary[];
};

export type LibrarySummary = {
	name: string;
	slices: SliceSummary[];
};
