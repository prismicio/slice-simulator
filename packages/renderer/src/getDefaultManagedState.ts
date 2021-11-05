import { ManagedState, StateManagerStatus } from "./types";

export const getDefaultManagedState = (): ManagedState => ({
	data: null,
	status: StateManagerStatus.Pending,
	error: null,
});
