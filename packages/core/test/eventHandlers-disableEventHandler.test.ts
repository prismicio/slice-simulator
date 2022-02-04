import test from "ava";
import * as sinon from "sinon";

import { disableEventHandler } from "../src";

test("prevents default and stops propagation", (t) => {
	const event = {
		preventDefault: sinon.spy(),
		stopPropagation: sinon.spy(),
	};

	disableEventHandler(event as unknown as Event);

	t.is(event.preventDefault.callCount, 1);
	t.is(event.stopPropagation.callCount, 1);
});
