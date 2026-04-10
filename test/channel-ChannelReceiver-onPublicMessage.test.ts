import { expect, it, vi } from "vitest"

import {
	ChannelReceiver,
	InternalEmitterRequestType,
	createErrorResponseMessage,
	createRequestMessage,
	createSuccessResponseMessage,
} from "../src/channel"

class StandaloneChannelReceiver extends ChannelReceiver {}

const dummyData = { foo: "bar" }
const trustedOrigin = "https://foo.prismic.io"


it("gets wired to public message events on class instantiation", () => {
	const channelReceiver = new StandaloneChannelReceiver({}, {})
	// @ts-expect-error - taking a shortcut by accessing protected property
	const onPublicMessageStub = vi.spyOn(channelReceiver, "_onPublicMessage")

	const event = new MessageEvent("message", { data: dummyData })
	window.dispatchEvent(event)

	expect(onPublicMessageStub).toHaveBeenCalledOnce()
	expect(onPublicMessageStub).toHaveBeenCalledWith(event)
})

it("debug logs messages when on debug mode", (ctx) => {
	vi.stubGlobal("console", { ...console, debug: vi.fn() })

	const channelReceiver = new StandaloneChannelReceiver({}, { debug: true })

	const request = createRequestMessage(ctx.task.name, dummyData)

	// @ts-expect-error - taking a shortcut by accessing private property
	channelReceiver._onPublicMessage({ data: request, origin: trustedOrigin })

	expect(
		console.debug,
		"calls `console.debug` twice: 1 for the response, 1 for the request",
	).toHaveBeenCalledTimes(2)
	expect(vi.mocked(console.debug).mock.calls[0][0]).toStrictEqual(request)
})

it("doesn't debug log messages when not on debug mode", (ctx) => {
	vi.stubGlobal("console", { ...console, debug: vi.fn() })

	const channelReceiver = new StandaloneChannelReceiver({}, { debug: false })

	const request = createRequestMessage(ctx.task.name, dummyData)

	// @ts-expect-error - taking a shortcut by accessing private property
	channelReceiver._onPublicMessage({ data: request, origin: trustedOrigin })

	expect(console.debug).not.toHaveBeenCalled()
})

it("doens't throw on invalid message received", () => {
	const channelReceiver = new StandaloneChannelReceiver({}, {})

	expect(() => {
		// @ts-expect-error - taking a shortcut by accessing private property
		channelReceiver._onPublicMessage({ data: null, origin: trustedOrigin })
	}).not.toThrow()
})

it("throws on other errors", (ctx) => {
	vi.stubGlobal("console", {
		...console,
		debug: () => {
			throw new Error(ctx.task.name)
		},
	})

	const channelReceiver = new StandaloneChannelReceiver({}, { debug: true })

	const request = createRequestMessage(ctx.task.name, dummyData)

	expect(() => {
		// @ts-expect-error - taking a shortcut by accessing private property
		channelReceiver._onPublicMessage({ data: request, origin: trustedOrigin })
	}).toThrow(ctx.task.name)

	vi.restoreAllMocks()
})

it("accepts connect requests", () => {
	const channelReceiver = new StandaloneChannelReceiver({}, {})
	// @ts-expect-error - taking a shortcut by accessing protected property
	const postResponseStub = vi.spyOn(channelReceiver, "postResponse")

	const channel = new MessageChannel()

	const request = createRequestMessage(InternalEmitterRequestType.Connect, undefined)
	const response = createSuccessResponseMessage(request.requestID, undefined)

	// @ts-expect-error - taking a shortcut by accessing private property
	channelReceiver._onPublicMessage({ data: request, ports: [channel.port1], origin: trustedOrigin })

	expect(postResponseStub).toHaveBeenCalledOnce()
	expect(postResponseStub).toHaveBeenCalledWith(response)
	// @ts-expect-error - taking a shortcut by accessing protected property
	expect(channelReceiver.port).toBe(channel.port1)
})

it("updates its options following connect request", () => {
	const channelReceiver = new StandaloneChannelReceiver({}, {})

	const channel = new MessageChannel()

	const request = createRequestMessage(InternalEmitterRequestType.Connect, dummyData)

	expect(channelReceiver.options.foo).toBeUndefined()

	// @ts-expect-error - taking a shortcut by accessing private property
	channelReceiver._onPublicMessage({ data: request, ports: [channel.port1], origin: trustedOrigin })

	expect(channelReceiver.options.foo).toBe("bar")
})

it("rejects non-connect requests", (ctx) => {
	const channelReceiver = new StandaloneChannelReceiver({}, {})
	// @ts-expect-error - taking a shortcut by accessing protected property
	const postResponseStub = vi.spyOn(channelReceiver, "postResponse")

	const request = createRequestMessage(ctx.task.name, dummyData)
	const response = createErrorResponseMessage(request.requestID, undefined)

	// @ts-expect-error - taking a shortcut by accessing private property
	channelReceiver._onPublicMessage({ data: request, origin: trustedOrigin })

	expect(postResponseStub).toHaveBeenCalledOnce()
	// @ts-expect-error - type is broken
	expect(postResponseStub.mock.calls[0][0]).toStrictEqual(response)
})

it("forwards response messages to default message handler when not ready", (ctx) => {
	vi.stubGlobal("console", { ...console, error: vi.fn() })

	const channelReceiver = new StandaloneChannelReceiver({}, {})
	// @ts-expect-error - taking a shortcut by accessing protected property
	const onMessageStub = vi.spyOn(channelReceiver, "onMessage")

	const response = createSuccessResponseMessage(ctx.task.name, undefined)

	// @ts-expect-error - taking a shortcut by accessing private property
	channelReceiver._onPublicMessage({ data: response, origin: trustedOrigin })

	expect(onMessageStub).toHaveBeenCalledOnce()
	expect(onMessageStub).toHaveBeenCalledWith({ data: response, origin: trustedOrigin })

	vi.restoreAllMocks()
})

it("doesn't forward response messages to default message handler once ready", (ctx) => {
	const channelReceiver = new StandaloneChannelReceiver({}, {})
	// @ts-expect-error - taking a shortcut by accessing protected property
	const onMessageStub = vi.spyOn(channelReceiver, "onMessage")
	// @ts-expect-error - taking a shortcut by setting private property
	channelReceiver._ready = true

	const response = createSuccessResponseMessage(ctx.task.name, undefined)

	// @ts-expect-error - taking a shortcut by accessing private property
	channelReceiver._onPublicMessage({ data: response, origin: trustedOrigin })

	expect(onMessageStub).not.toHaveBeenCalled()
})

it("accepts any origin in development", (ctx) => {
	const nodeEnv = process.env.NODE_ENV
	process.env.NODE_ENV = "development"

	const channelReceiver = new StandaloneChannelReceiver({}, {})
	// @ts-expect-error - taking a shortcut by accessing protected property
	const onMessageStub = vi.spyOn(channelReceiver, "onMessage")

	const response = createSuccessResponseMessage(ctx.task.name, undefined)

	try {
		// @ts-expect-error - taking a shortcut by accessing private property
		channelReceiver._onPublicMessage({
			data: response,
			origin: "http://foo.example.com",
		})
	} finally {
		process.env.NODE_ENV = nodeEnv
	}

	expect(onMessageStub).toHaveBeenCalledOnce()
	expect(onMessageStub).toHaveBeenCalledWith({
		data: response,
		origin: "http://foo.example.com",
	})
})

it("rejects non-https origins outside development", (ctx) => {
	const channelReceiver = new StandaloneChannelReceiver({}, {})
	// @ts-expect-error - taking a shortcut by accessing protected property
	const onMessageStub = vi.spyOn(channelReceiver, "onMessage")

	const response = createSuccessResponseMessage(ctx.task.name, undefined)

	// @ts-expect-error - taking a shortcut by accessing private property
	channelReceiver._onPublicMessage({
		data: response,
		origin: "http://foo.prismic.io",
	})

	expect(onMessageStub).not.toHaveBeenCalled()
})

it("rejects non-prismic origins outside development", (ctx) => {
	const channelReceiver = new StandaloneChannelReceiver({}, {})
	// @ts-expect-error - taking a shortcut by accessing protected property
	const onMessageStub = vi.spyOn(channelReceiver, "onMessage")

	const response = createSuccessResponseMessage(ctx.task.name, undefined)

	// @ts-expect-error - taking a shortcut by accessing private property
	channelReceiver._onPublicMessage({
		data: response,
		origin: "https://foo.example.com",
	})

	expect(onMessageStub).not.toHaveBeenCalled()
})
