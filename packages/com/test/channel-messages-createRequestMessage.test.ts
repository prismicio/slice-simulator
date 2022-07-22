import { it, expect } from "vitest";

import { createRequestMessage } from "../src/channel";

const dummyData = { foo: "bar" };

it("creates a valid request message", (ctx) => {
	const request = createRequestMessage(ctx.meta.name, dummyData);

	expect(request.requestID).toBeTypeOf("string");
	expect(isNaN(parseInt(request.requestID))).not.toBeNaN();

	request.requestID = "0";

	expect(request).toStrictEqual({
		requestID: "0",
		type: ctx.meta.name,
		data: dummyData,
	});
});

it("handles prefix", (ctx) => {
	const request = createRequestMessage(ctx.meta.name, dummyData, "baz");

	expect(request.requestID.startsWith("baz")).toBe(true);
});
