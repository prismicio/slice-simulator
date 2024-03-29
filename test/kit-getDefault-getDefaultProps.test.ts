import { expect, it } from "vitest";

import { getDefaultProps } from "../src/kit";

it("returns default props", () => {
	expect(getDefaultProps()).toMatchInlineSnapshot(`
		{
		  "background": "#ffffff",
		  "zIndex": 100,
		}
	`);
});
