import { it, expect } from "vitest";

import { getDefaultMessage } from "../src";

it("returns default message", (t) => {
	t.is(getDefaultMessage(), "");
});
