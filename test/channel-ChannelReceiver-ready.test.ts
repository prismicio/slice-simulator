import { expect, it, vi } from "vitest"

import type {
	UnknownRequestMessage} from "../src/channel";
import {
	ChannelReceiver,
	createSuccessResponseMessage,
} from "../src/channel"

class StandaloneChannelReceiver extends ChannelReceiver {}

it("throws when not embedded as an iframe", async () => {
	const channelReceiver = new StandaloneChannelReceiver({}, {})

	await expect(channelReceiver.ready()).rejects.toThrowError(
		"Receiver is currently not embedded as an iframe",
	)
})

it("sends ready request when embedded as an iframe", async (ctx) => {
	const channelReceiver = new StandaloneChannelReceiver(
		{},
		{ requestIDPrefix: ctx.task.name },
	)

	// Mock `window.parent.postMessage`
	let response
	const windowParentBck = window.parent
	// @ts-expect-error - deleting for test purpose
	delete window.parent
	const postMessageMock = vi.fn((request: UnknownRequestMessage) => {
		response = createSuccessResponseMessage(request.requestID, undefined)
		// @ts-expect-error - taking a shortcut by accessing private property
		channelReceiver._onPublicMessage({ data: response })
	})
	window.parent = {
		postMessage: postMessageMock as Window["postMessage"],
	} as Window["parent"]

	expect(await channelReceiver.ready()).toStrictEqual(response)
	expect(postMessageMock).toHaveBeenCalledOnce()
	// @ts-expect-error - taking a shortcut by accessing private property
	expect(channelReceiver._ready).toBe(true)

	window.parent = windowParentBck
})
