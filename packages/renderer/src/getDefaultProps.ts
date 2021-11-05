import { SliceCanvasProps } from "./types";

export const getDefaultProps = (): Required<
	Omit<SliceCanvasProps, "state">
> => ({
	zIndex: 100,
});
