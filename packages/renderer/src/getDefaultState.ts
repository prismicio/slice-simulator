import { State, StateManagerStatus } from "./types";

export const getDefaultState = (): State => ({
	data: null,
	status: StateManagerStatus.Pending,
	error: null,
});
