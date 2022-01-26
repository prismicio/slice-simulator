import { SliceZone } from "@prismicio/types";
import LibrariesState from "@slicemachine/core/build/src/models/LibrariesState";
import { ActiveSlice } from "@prismicio/slice-simulator-com";

import type { StateManager } from "./StateManager";

export enum StateManagerEventType {
	Loaded = "loaded",
	Slices = "slices",
	ActiveSlice = "activeSlice",
	Message = "message",
}

export type StateManagerEvents = {
	[StateManagerEventType.Loaded]: ManagedState;
	[StateManagerEventType.Slices]: SliceZone;
	[StateManagerEventType.ActiveSlice]: ActiveSlice | null;
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

export interface SliceSimulatorProps {
	state:
		| (() => Promise<LibrariesState.Libraries>)
		| Promise<LibrariesState.Libraries>
		| LibrariesState.Libraries;
	zIndex?: number | null;
	background?: string | null;
}

export interface SliceSimulatorData {
	stateManager: StateManager;
	managedState: ManagedState;
	slices: SliceZone;
	message: string;
}

export type SliceSimulatorOptions = SliceSimulatorProps & SliceSimulatorData;
