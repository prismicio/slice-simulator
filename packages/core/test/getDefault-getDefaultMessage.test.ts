import { it, expect } from "vitest";

import { getDefaultMessage } from "../src";

it("returns default message", () => {
	expect(getDefaultMessage()).toMatchInlineSnapshot('""');
});
