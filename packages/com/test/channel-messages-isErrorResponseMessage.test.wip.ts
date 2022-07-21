import { it, expect } from "vitest";
import {
	createErrorResponseMessage,
	createRequestMessage,
	createSuccessResponseMessage,
	isErrorResponseMessage,
} from "../src/channel";

const dummyData = { foo: "bar" };
const dummyError = dummyData;

it("returns false on request message", (t) => {
	const request = createRequestMessage(t.title, dummyData);

	t.false(isErrorResponseMessage(request));
});

it("returns false on success response message", (t) => {
	const response = createSuccessResponseMessage(t.title, dummyData);

	t.false(isErrorResponseMessage(response));
});

it("returns true on error response message", (t) => {
	const response = createErrorResponseMessage(t.title, dummyError);

	t.true(isErrorResponseMessage(response));
});
