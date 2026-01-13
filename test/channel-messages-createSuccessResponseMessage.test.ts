import { expect, it } from "vitest"

import { createSuccessResponseMessage } from "../src/channel"

const dummyData = { foo: "bar" }

it("creates a valid success response message with default status", (ctx) => {
	const response = createSuccessResponseMessage(ctx.task.name, dummyData)

	expect(response).toStrictEqual({
		requestID: ctx.task.name,
		status: 200,
		msg: "ok",
		data: dummyData,
	})
})

it("creates a valid success response message with status", (ctx) => {
	const response1 = createSuccessResponseMessage(ctx.task.name, dummyData, 201)

	expect(response1).toStrictEqual({
		requestID: ctx.task.name,
		status: 201,
		msg: "created",
		data: dummyData,
	})

	// @ts-expect-error - Invalid status
	const response2 = createSuccessResponseMessage(ctx.task.name, dummyData, 299)

	expect(response2).toStrictEqual({
		requestID: ctx.task.name,
		status: 299,
		msg: "",
		data: dummyData,
	})
})

it("throws when invalid success status is provided", (ctx) => {
	expect(() =>
		createSuccessResponseMessage(ctx.task.name, dummyData, 400),
	).toThrowError(TypeError)
})
