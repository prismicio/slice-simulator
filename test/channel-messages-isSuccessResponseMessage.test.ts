import { expect, it } from "vitest"

import {
	createErrorResponseMessage,
	createRequestMessage,
	createSuccessResponseMessage,
	isSuccessResponseMessage,
} from "../src/channel"

const dummyData = { foo: "bar" }
const dummyError = dummyData

it("returns false on request message", (ctx) => {
	const request = createRequestMessage(ctx.task.name, dummyData)

	expect(isSuccessResponseMessage(request)).toBe(false)
})

it("returns true on success response message", (ctx) => {
	const response = createSuccessResponseMessage(ctx.task.name, dummyData)

	expect(isSuccessResponseMessage(response)).toBe(true)
})

it("returns false on error response message", (ctx) => {
	const response = createErrorResponseMessage(ctx.task.name, dummyError)

	expect(isSuccessResponseMessage(response)).toBe(false)
})
