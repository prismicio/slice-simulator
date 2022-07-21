import { it, expect } from "vitest";

import { getDefaultProps } from "../src";

it("returns default props", (ctx) => {
	t.deepEqual(getDefaultProps(), {
		zIndex: 100,
		background: "#ffffff",
	});
});
