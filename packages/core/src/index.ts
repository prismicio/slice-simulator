// Main
export { CoreManager } from "./CoreManager";
export { StateManager } from "./StateManager";

// Defaults
export {
	getDefaultProps,
	getDefaultManagedState,
	getDefaultSlices,
	getDefaultMessage,
} from "./getDefault";

// DOM helpers
export {
	simulatorClass,
	simulatorRootClass,
	getSliceZoneDOM,
	getActiveSliceDOM,
} from "./domHelpers";

// Events
export { disableEventHandler, onClickHandler } from "./eventHandlers";

// Messages
export { sliceSimulatorAccessedDirectly } from "./messages";

// Types
export { StateManagerEventType, StateManagerStatus } from "./types";
export type {
	StateManagerEvents,
	ManagedState,
	SliceSimulatorProps,
	SliceSimulatorState,
	SliceSimulatorOptions,
} from "./types";
