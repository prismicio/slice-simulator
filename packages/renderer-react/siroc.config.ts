import { defineSirocConfig } from "siroc";

export default defineSirocConfig({
	rollup: {
		output: {
			sourcemap: true,
		},
		externals: ["../.slicemachine/slice-canvas-state.json"],
	},
});
