import { SliceCanvasProps } from "../dist";
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
}
