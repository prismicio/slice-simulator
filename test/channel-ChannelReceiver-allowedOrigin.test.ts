import { expect, it, vi } from "vitest"

import type { UnknownRequestMessage } from "../src/channel"
import {
	ChannelReceiver,
	InternalEmitterRequestType,
	createRequestMessage,
	createSuccessResponseMessage,
} from "../src/channel"

class StandaloneChannelReceiver extends ChannelReceiver {}

// --- Inbound origin validation ---

it("silently drops messages from non-matching origins when allowedOrigin is set", () => {
	const channelReceiver = new StandaloneChannelReceiver(
		{},
		{ allowedOrigin: "https://example.com" },
	)
	// @ts-expect-error - taking a shortcut by accessing protected property
	const postResponseStub = vi.spyOn(channelReceiver, "postResponse")

	const channel = new MessageChannel()
	const request = createRequestMessage(
		InternalEmitterRequestType.Connect,
		undefined,
	)

	// @ts-expect-error - taking a shortcut by accessing private property
	channelReceiver._onPublicMessage({
		data: request,
		origin: "https://evil.com",
		ports: [channel.port1],
	})

	expect(postResponseStub).not.toHaveBeenCalled()
})

it("accepts messages from matching origins when allowedOrigin is set", () => {
	const channelReceiver = new StandaloneChannelReceiver(
		{},
		{ allowedOrigin: "https://example.com" },
	)
	// @ts-expect-error - taking a shortcut by accessing protected property
	const postResponseStub = vi.spyOn(channelReceiver, "postResponse")

	const channel = new MessageChannel()
	const request = createRequestMessage(
		InternalEmitterRequestType.Connect,
		undefined,
	)
	const response = createSuccessResponseMessage(request.requestID, undefined)

	// @ts-expect-error - taking a shortcut by accessing private property
	channelReceiver._onPublicMessage({
		data: request,
		origin: "https://example.com",
		ports: [channel.port1],
	})

	expect(postResponseStub).toHaveBeenCalledOnce()
	expect(postResponseStub).toHaveBeenCalledWith(response)
})

it("accepts messages from any origin when allowedOrigin is null (default)", () => {
	const channelReceiver = new StandaloneChannelReceiver({}, {})
	// @ts-expect-error - taking a shortcut by accessing protected property
	const postResponseStub = vi.spyOn(channelReceiver, "postResponse")

	const channel = new MessageChannel()
	const request = createRequestMessage(
		InternalEmitterRequestType.Connect,
		undefined,
	)
	const response = createSuccessResponseMessage(request.requestID, undefined)

	// @ts-expect-error - taking a shortcut by accessing private property
	channelReceiver._onPublicMessage({
		data: request,
		origin: "https://any-origin.com",
		ports: [channel.port1],
	})

	expect(postResponseStub).toHaveBeenCalledOnce()
	expect(postResponseStub).toHaveBeenCalledWith(response)
})

// --- Outbound targetOrigin in ready() ---

it("uses allowedOrigin as targetOrigin in ready() postMessage", async () => {
	const channelReceiver = new StandaloneChannelReceiver(
		{},
		{ allowedOrigin: "https://example.com" },
	)

	// Mock `window.parent.postMessage`
	const windowParentBck = window.parent
	// @ts-expect-error - deleting for test purpose
	delete window.parent
	const postMessageMock = vi.fn(
		(request: UnknownRequestMessage, targetOrigin: string) => {
			const response = createSuccessResponseMessage(
				request.requestID,
				undefined,
			)
			// @ts-expect-error - taking a shortcut by accessing private property
			channelReceiver._onPublicMessage({
				data: response,
				origin: "https://example.com",
			})
		},
	)
	window.parent = {
		postMessage: postMessageMock as Window["postMessage"],
	} as Window["parent"]

	await channelReceiver.ready()

	expect(postMessageMock).toHaveBeenCalledOnce()
	expect(postMessageMock.mock.calls[0][1]).toBe("https://example.com")

	window.parent = windowParentBck
})

it("uses '*' as targetOrigin in ready() when allowedOrigin is null", async () => {
	const channelReceiver = new StandaloneChannelReceiver({}, {})

	// Mock `window.parent.postMessage`
	const windowParentBck = window.parent
	// @ts-expect-error - deleting for test purpose
	delete window.parent
	const postMessageMock = vi.fn(
		(request: UnknownRequestMessage, targetOrigin: string) => {
			const response = createSuccessResponseMessage(
				request.requestID,
				undefined,
			)
			// @ts-expect-error - taking a shortcut by accessing private property
			channelReceiver._onPublicMessage({ data: response })
		},
	)
	window.parent = {
		postMessage: postMessageMock as Window["postMessage"],
	} as Window["parent"]

	await channelReceiver.ready()

	expect(postMessageMock).toHaveBeenCalledOnce()
	expect(postMessageMock.mock.calls[0][1]).toBe("*")

	window.parent = windowParentBck
})

// --- allowedOrigin preserved during Connect options merge ---

it("preserves allowedOrigin when Connect request sends conflicting options", () => {
	const channelReceiver = new StandaloneChannelReceiver(
		{},
		{ allowedOrigin: "https://example.com" },
	)

	const channel = new MessageChannel()

	// Connect request data tries to overwrite allowedOrigin
	const request = createRequestMessage(InternalEmitterRequestType.Connect, {
		allowedOrigin: "https://evil.com",
		someOtherOption: true,
	})

	// @ts-expect-error - taking a shortcut by accessing private property
	channelReceiver._onPublicMessage({
		data: request,
		origin: "https://example.com",
		ports: [channel.port1],
	})

	expect(channelReceiver.options.allowedOrigin).toBe("https://example.com")
	// Verify that non-protected options ARE merged
	expect(channelReceiver.options.someOtherOption).toBe(true)
})

it("preserves null allowedOrigin during Connect options merge", () => {
	const channelReceiver = new StandaloneChannelReceiver({}, {})

	const channel = new MessageChannel()

	// Connect request data tries to set allowedOrigin
	const request = createRequestMessage(InternalEmitterRequestType.Connect, {
		allowedOrigin: "https://evil.com",
	})

	// @ts-expect-error - taking a shortcut by accessing private property
	channelReceiver._onPublicMessage({
		data: request,
		ports: [channel.port1],
	})

	expect(channelReceiver.options.allowedOrigin).toBeNull()
})
