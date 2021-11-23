// Main
export { StateManager } from "./StateManager";
export { createStateManager } from "./createStateManager";

// Props
export { getDefaultProps } from "./getDefaultProps";

// Data
export { getDefaultManagedState } from "./getDefaultManagedState";
export { getDefaultSlices } from "./getDefaultSlices";
export { getDefaultActiveSlice } from "./getDefaultActiveSlice";

// Types
export { StateManagerEventType, StateManagerStatus } from "./types";
export type {
	StateManagerEvents,
	ManagedState,
	ActiveSlice,
	SliceCanvasProps,
	SliceCanvasData,
	SliceCanvasOptions,
	VariationSummary,
	SliceSummary,
	LibrarySummary,
} from "./types";
