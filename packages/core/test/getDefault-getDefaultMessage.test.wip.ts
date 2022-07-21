import { it, expect } from "vitest";

import { getDefaultMessage } from "../src";

it("returns default message", (ctx) => {
	t.is(getDefaultMessage(), "");
});
