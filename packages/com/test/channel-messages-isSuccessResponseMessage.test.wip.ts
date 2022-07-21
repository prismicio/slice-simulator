import { it, expect } from "vitest";
import {
	createErrorResponseMessage,
	createRequestMessage,
	createSuccessResponseMessage,
	isSuccessResponseMessage,
} from "../src/channel";

const dummyData = { foo: "bar" };
const dummyError = dummyData;

it("returns false on request message", (t) => {
	const request = createRequestMessage(t.title, dummyData);

	t.false(isSuccessResponseMessage(request));
});

it("returns true on success response message", (t) => {
	const response = createSuccessResponseMessage(t.title, dummyData);

	t.true(isSuccessResponseMessage(response));
});

it("returns false on error response message", (t) => {
	const response = createErrorResponseMessage(t.title, dummyError);

	t.false(isSuccessResponseMessage(response));
});
