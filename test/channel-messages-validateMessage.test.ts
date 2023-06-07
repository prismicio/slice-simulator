import { expect, it } from "vitest";

import {
	createErrorResponseMessage,
	createRequestMessage,
	createSuccessResponseMessage,
	validateMessage,
} from "../src/channel";

const dummyData = { foo: "bar" };
const dummyError = dummyData;

it("validates valid request message", (ctx) => {
	const request = createRequestMessage(ctx.meta.name, dummyData);

	expect(() => validateMessage(request)).not.toThrowError();
});

it("validates valid success response message", (ctx) => {
	const response = createSuccessResponseMessage(ctx.meta.name, dummyData);

	expect(() => validateMessage(response)).not.toThrowError();
});

it("validates valid error response message", (ctx) => {
	const response = createErrorResponseMessage(ctx.meta.name, dummyError);

	expect(() => validateMessage(response)).not.toThrowError();
});

it("throws on non-object", () => {
	const message1 = 1;

	expect(() => validateMessage(message1)).toThrowError(TypeError);

	const message2 = null;

	expect(() => validateMessage(message2)).toThrowError(TypeError);
});

it("throws on invalid object", () => {
	const message1 = {};

	expect(() => validateMessage(message1)).toThrowError(TypeError);

	const message2 = {
		foo: "bar",
	};

	expect(() => validateMessage(message2)).toThrowError(TypeError);
});

it("throws on invalid requestID", (ctx) => {
	const message: Record<string, unknown> = createRequestMessage(
		ctx.meta.name,
		dummyData,
	);
	message.requestID = 1;

	expect(() => validateMessage(message)).toThrowError(TypeError);
});
