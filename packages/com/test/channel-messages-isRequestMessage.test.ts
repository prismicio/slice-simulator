import { it, expect } from "vitest";
import {
	createErrorResponseMessage,
	createRequestMessage,
	createSuccessResponseMessage,
	isRequestMessage,
} from "../src/channel";

const dummyData = { foo: "bar" };
const dummyError = dummyData;

it("returns true on request message", (ctx) => {
	const request = createRequestMessage(ctx.meta.name, dummyData);

	expect(isRequestMessage(request)).toBe(true);
});

it("returns false on success response message", (ctx) => {
	const response = createSuccessResponseMessage(ctx.meta.name, dummyData);

	expect(isRequestMessage(response)).toBe(false);
});

it("returns false on error response message", (ctx) => {
	const response = createErrorResponseMessage(ctx.meta.name, dummyError);

	expect(isRequestMessage(response)).toBe(false);
});
