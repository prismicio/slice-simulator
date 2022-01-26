import { SliceSimulatorProps } from "./types";

export const getDefaultProps = (): Required<{
	[K in keyof Omit<SliceSimulatorProps, "state">]: NonNullable<
		SliceSimulatorProps[K]
	>;
}> => ({
	zIndex: 100,
	background: "#ffffff",
});
