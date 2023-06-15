import type { SliceZone } from "@prismicio/client";

import type { ActiveSlice } from "../types";

import type { SimulatorManager } from "./SimulatorManager";

export enum StateEventType {
	Slices = "slices",
	ActiveSlice = "activeSlice",
	Message = "message",
}

export type StateEvents = {
	[StateEventType.Slices]: SliceZone;
	[StateEventType.ActiveSlice]: ActiveSlice | null;
	[StateEventType.Message]: string;
};

export interface SliceSimulatorProps {
	zIndex?: number;
	background?: string;
}

export interface SliceSimulatorState {
	manager: SimulatorManager;
	slices: SliceZone;
	message: string;
}

export type SliceSimulatorOptions = SliceSimulatorProps & SliceSimulatorState;
