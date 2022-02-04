import test from "ava";

import { getDefaultProps } from "../src";

test("returns default props", (t) => {
	t.deepEqual(getDefaultProps(), {
		zIndex: 100,
		background: "#ffffff",
	});
});
