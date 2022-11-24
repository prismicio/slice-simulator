import { it, expect } from "vitest";

import { getDefaultProps } from "../src";

it("returns default props", () => {
	expect(getDefaultProps()).toMatchInlineSnapshot(`
		{
		  "background": "#ffffff",
		  "state": {},
		  "zIndex": 100,
		}
	`);
});
