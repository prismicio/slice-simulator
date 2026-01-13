import { expect, it } from "vitest"

import {
	createErrorResponseMessage,
	createRequestMessage,
	createSuccessResponseMessage,
	isErrorResponseMessage,
} from "../src/channel"

const dummyData = { foo: "bar" }
const dummyError = dummyData

it("returns false on request message", (ctx) => {
	const request = createRequestMessage(ctx.task.name, dummyData)

	expect(isErrorResponseMessage(request)).toBe(false)
})

it("returns false on success response message", (ctx) => {
	const response = createSuccessResponseMessage(ctx.task.name, dummyData)

	expect(isErrorResponseMessage(response)).toBe(false)
})

it("returns true on error response message", (ctx) => {
	const response = createErrorResponseMessage(ctx.task.name, dummyError)

	expect(isErrorResponseMessage(response)).toBe(true)
})
