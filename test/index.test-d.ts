import { expectTypeOf, it } from "vitest";

import * as lib from "../src";

it("is constructible", () => {
	expectTypeOf(lib.SimulatorClient).toBeConstructibleWith(
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		document.querySelector("iframe")!,
	);
});
