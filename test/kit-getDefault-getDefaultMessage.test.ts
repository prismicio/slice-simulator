import { it, expect } from "vitest";

import { getDefaultMessage } from "../src/kit";

it("returns default message", () => {
	expect(getDefaultMessage()).toMatchInlineSnapshot('""');
});
