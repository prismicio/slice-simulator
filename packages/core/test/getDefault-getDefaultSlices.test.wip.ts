import { it, expect } from "vitest";

import { getDefaultSlices } from "../src";

it("returns default slices", (t) => {
	t.deepEqual(getDefaultSlices(), []);
});
