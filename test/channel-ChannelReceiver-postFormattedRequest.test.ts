import { expect, it, vi } from "vitest"

import { ChannelReceiver, NotReadyError } from "../src/channel"

class StandaloneChannelReceiver extends ChannelReceiver {}

const dummyData = { foo: "bar" }

it("throws when not ready", (ctx) => {
	const channelReceiver = new StandaloneChannelReceiver({}, {})

	expect(() => {
		// @ts-expect-error - taking a shortcut by accessing protected property
		channelReceiver.postFormattedRequest(ctx.task.name, dummyData)
	}).toThrowError(NotReadyError)
})

it("forwards request to default post request handler once ready", (ctx) => {
	const channelReceiver = new StandaloneChannelReceiver(
		{},
		{ requestIDPrefix: ctx.task.name },
	)

	const postRequestStub = vi.fn()
	// @ts-expect-error - taking a shortcut by accessing protected property
	channelReceiver.postRequest = postRequestStub
	// @ts-expect-error - taking a shortcut by setting private property
	channelReceiver._ready = true

	// @ts-expect-error - taking a shortcut by accessing protected property
	channelReceiver.postFormattedRequest(ctx.task.name, dummyData, {
		timeout: 1000,
	})

	expect(postRequestStub).toHaveBeenCalledOnce()
	expect(postRequestStub.mock.calls[0][0].requestID.replace(/\d+/, "")).toBe(
		ctx.task.name,
	)
	expect(postRequestStub.mock.calls[0][0].type, ctx.task.name)
	expect(postRequestStub.mock.calls[0][0].data).toStrictEqual(dummyData)
	expect(postRequestStub.mock.calls[0][1]).toBeUndefined()
	expect(postRequestStub.mock.calls[0][2]).toStrictEqual({ timeout: 1000 })
})
