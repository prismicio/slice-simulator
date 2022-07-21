import { it, expect } from "vitest";
import * as sinon from "sinon";

import { sleep } from "./__testutils__/sleep";

import { throttle } from "../src/lib/throttle";

it("throttles function", async (ctx) => {
	const fn = sinon.spy();
	const throttled = throttle(fn);

	throttled(); // t=0
	throttled(); // skipped
	throttled(); // t=16

	t.is(fn.callCount, 1, "throttles calls");

	await sleep(24); // t=24

	t.is(fn.callCount, 2, "if subsequent calls, calls last on tail");
});

it("throttles function consitently", async (ctx) => {
	const fn = sinon.spy();
	const throttled = throttle(fn, 50);

	throttled(); // t=0
	throttled(); // skipped
	throttled(); // t=50

	t.is(fn.callCount, 1, "throttles calls");

	await sleep(75); // t=75

	t.is(fn.callCount, 2, "if subsequent calls, calls last on tail");

	throttled(); // skipped
	throttled(); // skipped
	throttled(); // t=100

	t.is(fn.callCount, 2, "waits after tail call before calling again");

	await sleep(35); // t=110

	t.is(fn.callCount, 3, "calls tail again after delay");

	await sleep(50); // t=160

	throttled(); // t=160
	throttled(); // skipped
	throttled(); // t=210

	t.is(fn.callCount, 4, "calls directly after delay has expired");

	await sleep(50); // t=210

	t.is(fn.callCount, 5, "if subsequent calls, still calls last on tail");
});
