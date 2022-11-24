import * as t from "io-ts";

import { SliceZone } from "@prismicio/types";

import { ActiveSlice } from "@prismicio/slice-simulator-com";

import type { CoreManager } from "./CoreManager";

export const LibrariesStateLike = t.record(
	t.string,
	t.intersection([
		t.partial({
			name: t.string,
		}),
		t.type({
			components: t.record(
				t.string,
				t.intersection([
					t.type({
						id: t.string,
						model: t.intersection([
							t.type({
								id: t.string,
								variations: t.array(
									t.intersection([
										t.type({ id: t.string }),
										t.partial({ name: t.string }),
									]),
								),
							}),
							t.partial({ name: t.string }),
						]),
						mocks: t.record(t.string, t.type({ variation: t.string })),
					}),
					t.partial({
						name: t.string,
					}),
				]),
			),
		}),
	]),
);
export type LibrariesStateLike = t.TypeOf<typeof LibrariesStateLike>;

export enum StateManagerEventType {
	ManagedState = "managedState",
	Slices = "slices",
	ActiveSlice = "activeSlice",
	Message = "message",
}

export type StateManagerEvents = {
	[StateManagerEventType.ManagedState]: ManagedState;
	[StateManagerEventType.Slices]: SliceZone;
	[StateManagerEventType.ActiveSlice]: ActiveSlice | null;
	[StateManagerEventType.Message]: string;
};

export enum StateManagerStatus {
	Pending = "pending",
	Loaded = "loaded",
	Error = "error",
}

export type ManagedState = {
	data: LibrariesStateLike | null;
	status: StateManagerStatus;
	error: Error | null;
};

export interface SliceSimulatorProps {
	state?:
		| (() => Promise<LibrariesStateLike>)
		| Promise<LibrariesStateLike>
		| LibrariesStateLike;
	zIndex?: number;
	background?: string;
}

export interface SliceSimulatorState {
	coreManager: CoreManager;
	managedState: ManagedState;
	slices: SliceZone;
	message: string;
}

export type SliceSimulatorOptions = SliceSimulatorProps & SliceSimulatorState;
