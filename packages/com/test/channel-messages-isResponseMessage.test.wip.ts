import { it, expect } from "vitest";
import {
	createErrorResponseMessage,
	createRequestMessage,
	createSuccessResponseMessage,
	isResponseMessage,
} from "../src/channel";

const dummyData = { foo: "bar" };
const dummyError = dummyData;

it("returns false on request message", (t) => {
	const request = createRequestMessage(t.title, dummyData);

	t.false(isResponseMessage(request));
});

it("returns true on success response message", (t) => {
	const response = createSuccessResponseMessage(t.title, dummyData);

	t.true(isResponseMessage(response));
});

it("returns true on error response message", (t) => {
	const response = createErrorResponseMessage(t.title, dummyError);

	t.true(isResponseMessage(response));
});
