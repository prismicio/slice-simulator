import { SliceSimulatorProps } from "./types";

export const getDefaultProps = (): Required<
	Omit<SliceSimulatorProps, "state">
> => ({
	zIndex: 100,
});
