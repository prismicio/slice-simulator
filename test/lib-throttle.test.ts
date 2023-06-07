import { it, expect, vi } from "vitest";

import { sleep } from "./__testutils__/sleep";

import { throttle } from "../src/lib/throttle";

it("throttles function", async () => {
	const fn = vi.fn();
	const throttled = throttle(fn);

	throttled(); // t=0
	throttled(); // skipped
	throttled(); // t=16

	expect(fn, "throttles calls").toHaveBeenCalledOnce();

	await sleep(24); // t=24

	expect(fn, "if subsequent calls, calls last on tail").toHaveBeenCalledTimes(
		2,
	);
});

it("throttles function consitently", async () => {
	const fn = vi.fn();
	const throttled = throttle(fn, 50);

	throttled(); // t=0
	throttled(); // skipped
	throttled(); // t=50

	expect(fn, "throttles calls").toHaveBeenCalledOnce();

	await sleep(75); // t=75

	expect(fn, "if subsequent calls, calls last on tail").toHaveBeenCalledTimes(
		2,
	);

	throttled(); // skipped
	throttled(); // skipped
	throttled(); // t=100

	expect(
		fn,
		"waits after tail call before calling again",
	).toHaveBeenCalledTimes(2);

	await sleep(35); // t=110

	expect(fn, "calls tail again after delay").toHaveBeenCalledTimes(3);

	await sleep(50); // t=160

	throttled(); // t=160
	throttled(); // skipped
	throttled(); // t=210

	expect(fn, "calls directly after delay has expired").toHaveBeenCalledTimes(4);

	await sleep(50); // t=210

	expect(
		fn,
		"if subsequent calls, still calls last on tail",
	).toHaveBeenCalledTimes(5);
});
