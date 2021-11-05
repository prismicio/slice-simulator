/* eslint-disable @typescript-eslint/no-explicit-any */
import { SliceZone } from "@prismicio/types";

import { SliceCanvasProps, LibrarySummary } from "./types";
import { getDefaultManagedState } from "./getDefaultManagedState";
import { EventEmitter } from "./lib/EventEmitter";

import { ManagedState, StateManagerStatus } from "./types";

export type StateManagerEvents = {
	loaded: ManagedState;
};

export class StateManager extends EventEmitter<StateManagerEvents> {
	public managedState: ManagedState;

	constructor(managedState: ManagedState = getDefaultManagedState()) {
		super();

		this.managedState = managedState;
	}

	async load(state: SliceCanvasProps["state"]): Promise<void> {
		try {
			const data = await (typeof state === "function" ? state() : state);

			this.managedState = {
				data: Array.isArray(data) ? data : data.default,
				status: StateManagerStatus.Loaded,
				error: null,
			};
		} catch (error) {
			console.error(error);

			this.managedState = {
				data: null,
				status: StateManagerStatus.Error,
				error: error as Error,
			};
		}

		this.emit("loaded", this.managedState);
	}

	// TODO: Temporary solution, should be refactored
	getLibraries(): LibrarySummary[] {
		if (
			this.managedState.status !== StateManagerStatus.Loaded ||
			!this.managedState.data
		) {
			throw new Error("State is not loaded, use `StateManager.load()` first");
		}

		return this.managedState.data.map((library) => {
			return {
				name: library.name,
				slices: library.components.map((slice) => {
					return {
						name: slice.infos.model.name,
						id: slice.infos.model.id,
						variations: slice.infos.model.variations.map((variation) => {
							return {
								name: variation.name,
								id: variation.id,
							};
						}),
					};
				}),
			};
		});
	}

	// TODO: Temporary solution, should be refactored
	getSliceZoneFromSliceIDs(
		slices: {
			sliceID: string;
			variationID: string;
		}[],
	): SliceZone {
		if (
			this.managedState.status !== StateManagerStatus.Loaded ||
			!this.managedState.data
		) {
			throw new Error("State is not loaded, use `StateManager.load()` first");
		}

		const allMocks = this.managedState.data
			.map((library) =>
				library.components.map((slice) => slice.infos.mock).flat(),
			)
			.flat()
			.filter(Boolean) as any;

		return slices.map((slice) => {
			return allMocks.find((mock: any) => {
				return (
					mock.slice_type === slice.sliceID &&
					mock.variation === slice.variationID
				);
			});
		}) as unknown as SliceZone;
	}
}
