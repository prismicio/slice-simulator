import { SharedSlice, SliceZone } from "@prismicio/types";
import LibrariesState from "@slicemachine/core/build/src/models/LibrariesState";

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
			const raw = await (typeof state === "function" ? state() : state);

			const res = LibrariesState.Libraries.decode(raw);
			if (res._tag === "Left") {
				console.error(res.left);
				throw new Error(
					"State does not validate expected format, see trace above for detailed report",
				);
			}

			this.managedState = {
				data: res.right,
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

		return Object.entries(this.managedState.data).map(
			([libraryPath, slices]) => {
				return {
					path: libraryPath,
					slices: Object.values(slices).map((slice) => {
						return {
							id: slice.id,
							name: slice.name || slice.id,
							variations: slice.model.variations.map((variation) => {
								return {
									id: variation.id,
									name: variation.name || variation.id,
								};
							}),
						};
					}),
				};
			},
		);
	}

	// TODO: Temporary solution, should be refactored
	getSliceZoneFromSliceIDs(
		slices: {
			sliceID: string;
			variationID: string;
		}[],
		loose = false, // TODO: Temporary solution to mimic Storybook iframe interface
	): SliceZone {
		if (
			this.managedState.status !== StateManagerStatus.Loaded ||
			!this.managedState.data
		) {
			throw new Error("State is not loaded, use `StateManager.load()` first");
		}

		const keyed = (str: string) =>
			loose ? str.toLowerCase().replace(/[-_]/g, "") : str;

		const allMocks = Object.values(this.managedState.data).reduce<
			Record<string, Record<string, SharedSlice>>
		>((acc, sliceMap) => {
			Object.values(sliceMap).forEach((slice) => {
				acc[keyed(slice.id)] = Object.values(slice.mocks).reduce<
					Record<string, SharedSlice>
				>((acc, mock) => {
					// TODO: Type definition from Slice Machine core is incomplete
					acc[keyed(mock.variation)] = mock as unknown as SharedSlice;

					return acc;
				}, {});
			});

			return acc;
		}, {});

		return slices
			.map((slice) => {
				const sliceID = keyed(slice.sliceID);
				const variationID = keyed(slice.variationID);

				if (sliceID in allMocks && variationID in allMocks[sliceID]) {
					return allMocks[sliceID][variationID];
				}
			})
			.filter(Boolean) as SliceZone;
	}
}
