import { Library } from "slicemachine-core/models/Library";
import { getDefaultState } from "./getDefaultState";
import { EventEmitter } from "./EventEmitter";

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

	async load(predicate: () => Promise<unknown>): Promise<void> {
		try {
			const data = await predicate();

			this.state = {
				data: (data && typeof data === "object" && "default" in data
					? // When using import()
					  (data as { default: unknown }).default
					: // When using require()
					  data) as Library[],
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
}
