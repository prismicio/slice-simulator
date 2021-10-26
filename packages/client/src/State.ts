import { Library } from "slicemachine-core/models/Library";

export const enum Status {
	Pending = "pending",
	Loaded = "loaded",
	Error = "error",
}

export type StateInterface = {
	data: Library[] | null;
	status: Status;
	error: Error | null;
};

export class State {
	static getDefault(): StateInterface {
		return {
			data: null,
			status: Status.Pending,
			error: null,
		};
	}

	static async load(predicate: () => Promise<Library[]>, callback: (state: StateInterface) => void): Promise<void> {
		try {
			callback({
				data: await predicate(),
				status: Status.Loaded,
				error: null,
			})
		} catch (error) {
			console.error(error);

			callback({
				data: null,
				status: Status.Error,
				error: error as Error,
			})
		}
	}
}
