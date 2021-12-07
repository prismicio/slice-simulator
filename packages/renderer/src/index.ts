// Main
export { StateManager } from "./StateManager";
export { createStateManager } from "./createStateManager";

// Props
export { getDefaultProps } from "./getDefaultProps";

// Data
export { getDefaultManagedState } from "./getDefaultManagedState";
export { getDefaultSlices } from "./getDefaultSlices";

// Events
export { disableEventHandler } from "./disableEventHandler";
export { onClickHandler } from "./onClickHandler";

// Types
export { StateManagerEventType, StateManagerStatus } from "./types";
export type {
	StateManagerEvents,
	ManagedState,
	SliceCanvasProps,
	SliceCanvasData,
	SliceCanvasOptions,
} from "./types";
