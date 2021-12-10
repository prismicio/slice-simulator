import { SliceZone } from "@prismicio/types";
import LibrariesState from "@slicemachine/core/build/src/models/LibrariesState";

import type { StateManager } from "./StateManager";

export enum StateManagerEventType {
	Loaded = "loaded",
	Slices = "slices",
	Message = "message",
}

export type StateManagerEvents = {
	[StateManagerEventType.Loaded]: ManagedState;
	[StateManagerEventType.Slices]: SliceZone;
	[StateManagerEventType.Message]: string;
};

export const enum StateManagerStatus {
	Pending = "pending",
	Loaded = "loaded",
	Error = "error",
}

export type ManagedState = {
	data: LibrariesState.Libraries | null;
	status: StateManagerStatus;
	error: Error | null;
};

export interface SliceCanvasProps {
	state:
		| (() => Promise<LibrariesState.Libraries>)
		| Promise<LibrariesState.Libraries>
		| LibrariesState.Libraries;
	zIndex?: number;
}

export interface SliceCanvasData {
	stateManager: StateManager;
	managedState: ManagedState;
	slices: SliceZone;
	message: string;
}

export type SliceCanvasOptions = SliceCanvasProps & SliceCanvasData;
