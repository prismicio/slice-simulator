import { it, expect } from "vitest";
import {
	createErrorResponseMessage,
	createRequestMessage,
	createSuccessResponseMessage,
	isRequestMessage,
} from "../src/channel";

const dummyData = { foo: "bar" };
const dummyError = dummyData;

it("returns true on request message", (t) => {
	const request = createRequestMessage(t.title, dummyData);

	t.true(isRequestMessage(request));
});

it("returns false on success response message", (t) => {
	const response = createSuccessResponseMessage(t.title, dummyData);

	t.false(isRequestMessage(response));
});

it("returns false on error response message", (t) => {
	const response = createErrorResponseMessage(t.title, dummyError);

	t.false(isRequestMessage(response));
});
