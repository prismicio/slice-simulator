import { expect, it } from "vitest"

import { createErrorResponseMessage } from "../src/channel"

const dummyError = { foo: "bar" }

it("creates a valid error response message with default status", (ctx) => {
	const response = createErrorResponseMessage(ctx.task.name, dummyError)

	expect(response).toStrictEqual({
		requestID: ctx.task.name,
		status: 400,
		msg: "bad request",
		error: dummyError,
	})
})

it("creates a valid error response message with status", (ctx) => {
	const response1 = createErrorResponseMessage(ctx.task.name, dummyError, 500)

	expect(response1).toStrictEqual({
		requestID: ctx.task.name,
		status: 500,
		msg: "internal server error",
		error: dummyError,
	})

	// @ts-expect-error - Invalid status
	const response2 = createErrorResponseMessage(ctx.task.name, dummyError, 599)

	expect(response2).toStrictEqual({
		requestID: ctx.task.name,
		status: 599,
		msg: "",
		error: dummyError,
	})
})

it("throws when invalid error status is provided", (ctx) => {
	expect(() =>
		createErrorResponseMessage(ctx.task.name, dummyError, 200),
	).toThrowError(TypeError)
})
