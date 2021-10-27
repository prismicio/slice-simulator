/* eslint-disable @typescript-eslint/no-explicit-any */
import { Slice, SliceZone } from "@prismicio/types";

import {
	SliceCanvasProps,
	LibrarySummary,
	SliceSummary,
	VariationSummary,
} from "./types";
import { getDefaultState } from "./getDefaultState";
import { EventEmitter } from "./lib/EventEmitter";

import { State, StateManagerStatus } from "./types";

export type StateManagerEvents = {
	loaded: State;
};

export class StateManager extends EventEmitter<StateManagerEvents> {
	public state: State;

	constructor(state: State = getDefaultState()) {
		super();

		this.state = state;
	}

	async load(predicate: SliceCanvasProps["statePredicate"]): Promise<void> {
		try {
			const data = await (typeof predicate === "function"
				? predicate()
				: predicate);

			this.state = {
				data: Array.isArray(data) ? data : data.default,
				status: StateManagerStatus.Loaded,
				error: null,
			};
		} catch (error) {
			console.error(error);

			this.state = {
				data: null,
				status: StateManagerStatus.Error,
				error: error as Error,
			};
		}

		this.emit("loaded", this.state);
	}

	getLibraries(): LibrarySummary[] {
		if (this.state.status !== StateManagerStatus.Loaded || !this.state.data) {
			throw new Error("State is not loaded, use `StateManager.load()` first");
		}

		return this.state.data.map((library) => {
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

	// TODO: Refactor as part of core?
	getSlicesByID(
		slices: {
			slice: SliceSummary;
			variation: VariationSummary;
		}[],
	): SliceZone {
		if (this.state.status !== StateManagerStatus.Loaded || !this.state.data) {
			throw new Error("State is not loaded, use `StateManager.load()` first");
		}

		const allMocks = this.state.data
			.map((library) =>
				library.components.map((slice) => slice.infos.mock).flat(),
			)
			.flat()
			.filter(Boolean) as any;

		return slices.map((slice) => {
			return allMocks.find((mock: any) => {
				return (
					mock.slice_type === slice.slice.id &&
					mock.variation === slice.variation.id
				);
			});
		}) as unknown as SliceZone;
	}
}
