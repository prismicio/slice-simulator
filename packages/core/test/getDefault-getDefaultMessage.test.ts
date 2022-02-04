import test from "ava";

import { getDefaultMessage } from "../src";

test("returns default message", (t) => {
	t.is(getDefaultMessage(), "");
});
