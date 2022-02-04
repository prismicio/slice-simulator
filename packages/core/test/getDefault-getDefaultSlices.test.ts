import test from "ava";

import { getDefaultSlices } from "../src";

test("returns default slices", (t) => {
	t.deepEqual(getDefaultSlices(), []);
});
