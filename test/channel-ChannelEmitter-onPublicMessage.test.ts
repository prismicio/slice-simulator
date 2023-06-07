import { it, expect, vi } from "vitest";

import {
	ChannelEmitter,
	createErrorResponseMessage,
	createRequestMessage,
	createSuccessResponseMessage,
	InternalReceiverRequestType,
} from "../src/channel";

class StandaloneChannelEmitter extends ChannelEmitter {}

const iframe = document.createElement("iframe");

const dummyData = { foo: "bar" };

it("gets wired to public message events on class instantiation", () => {
	const channelEmitter = new StandaloneChannelEmitter(iframe, {}, {});

	const onPublicMessageStub = vi.fn();
	// @ts-expect-error - taking a shortcut by accessing protected property
	vi.spyOn(channelEmitter, "_onPublicMessage").mockImplementation(
		onPublicMessageStub,
	);

	const event = new MessageEvent("message", {
		data: dummyData,
		source: iframe.contentWindow,
	});
	window.dispatchEvent(event);

	expect(onPublicMessageStub).toHaveBeenCalledOnce();
	expect(onPublicMessageStub).toHaveBeenCalledWith(event);
});

it("debug logs messages when on debug mode", async (ctx) => {
	vi.stubGlobal("console", { ...console, debug: vi.fn() });

	const channelEmitter = new StandaloneChannelEmitter(
		iframe,
		{},
		{ debug: true },
	);

	const request = createRequestMessage(ctx.meta.name, dummyData);

	// @ts-expect-error - taking a shortcut by accessing private property
	await channelEmitter._onPublicMessage({
		data: request,
		source: iframe.contentWindow,
	});

	expect(
		console.debug,
		"calls `console.debug` twice: 1 for the response, 1 for the request",
	).toHaveBeenCalledTimes(2);
	expect(vi.mocked(console.debug).mock.calls[0][0]).toStrictEqual(request);

	vi.restoreAllMocks();
});

it("doesn't debug log messages when not on debug mode", async (ctx) => {
	vi.stubGlobal("console", { ...console, debug: vi.fn() });

	const channelEmitter = new StandaloneChannelEmitter(
		iframe,
		{},
		{ debug: false },
	);

	const request = createRequestMessage(ctx.meta.name, dummyData);

	// @ts-expect-error - taking a shortcut by accessing private property
	await channelEmitter._onPublicMessage({
		data: request,
		source: iframe.contentWindow,
	});

	expect(console.debug).not.toHaveBeenCalled();

	vi.restoreAllMocks();
});

it("ignores event not coming from target", async (ctx) => {
	// Using debug mode as a way to make sure function returns early
	vi.stubGlobal("console", { ...console, debug: vi.fn() });

	const channelEmitter = new StandaloneChannelEmitter(
		iframe,
		{},
		{ debug: true },
	);

	const request = createRequestMessage(ctx.meta.name, dummyData);

	// @ts-expect-error - taking a shortcut by accessing private property
	await channelEmitter._onPublicMessage({ data: request });

	expect(console.debug).not.toHaveBeenCalled();

	vi.restoreAllMocks();
});

it("doens't throw on invalid message received", async () => {
	const channelEmitter = new StandaloneChannelEmitter(iframe, {}, {});

	await expect(
		// @ts-expect-error - taking a shortcut by accessing private property
		channelEmitter._onPublicMessage({
			data: null,
			source: iframe.contentWindow,
		}),
	).resolves.not.toThrowError();
});

it("throws on other errors", async (ctx) => {
	vi.stubGlobal("console", {
		...console,
		debug: () => {
			throw new Error(ctx.meta.name);
		},
	});

	const channelEmitter = new StandaloneChannelEmitter(
		iframe,
		{},
		{ debug: true },
	);

	const request = createRequestMessage(ctx.meta.name, dummyData);

	await expect(
		// @ts-expect-error - taking a shortcut by accessing private property
		channelEmitter._onPublicMessage({
			data: request,
			source: iframe.contentWindow,
		}),
	).rejects.toThrowError(ctx.meta.name);

	vi.restoreAllMocks();
});

it("accepts ready requests", async () => {
	const channelEmitter = new StandaloneChannelEmitter(iframe, {}, {});

	const request = createRequestMessage(
		InternalReceiverRequestType.Ready,
		dummyData,
	);

	// @ts-expect-error - taking a shortcut by accessing private property
	await channelEmitter._onPublicMessage({
		data: request,
		source: iframe.contentWindow,
	});

	// @ts-expect-error - taking a shortcut by accessing private property
	expect(channelEmitter._receiverReady).toBe(request.requestID);
});

it("accepts ready requests and call `receiverReadyCallback` when available", async () => {
	const channelEmitter = new StandaloneChannelEmitter(iframe, {}, {});

	const receiverReadyCallbackStub = vi.fn();
	// @ts-expect-error - taking a shortcut by accessing private property
	channelEmitter._receiverReadyCallback = receiverReadyCallbackStub;

	const request = createRequestMessage(
		InternalReceiverRequestType.Ready,
		dummyData,
	);

	// @ts-expect-error - taking a shortcut by accessing private property
	await channelEmitter._onPublicMessage({
		data: request,
		source: iframe.contentWindow,
	});

	// @ts-expect-error - taking a shortcut by accessing private property
	expect(channelEmitter._receiverReady).toBe(request.requestID);
	expect(receiverReadyCallbackStub).toHaveBeenCalledOnce();
});

it("rejects non-ready requests", async (ctx) => {
	const channelEmitter = new StandaloneChannelEmitter(iframe, {}, {});

	const postResponseStub = vi.fn();
	// @ts-expect-error - taking a shortcut by accessing protected property
	vi.spyOn(channelEmitter, "postResponse").mockImplementation(postResponseStub);

	const request = createRequestMessage(ctx.meta.name, dummyData);
	const response = createErrorResponseMessage(request.requestID, undefined);

	// @ts-expect-error - taking a shortcut by accessing private property
	await channelEmitter._onPublicMessage({
		data: request,
		source: iframe.contentWindow,
	});

	expect(postResponseStub).toHaveBeenCalledOnce();
	expect(postResponseStub.mock.calls[0][0]).toStrictEqual(response);
});

it("ignores response messages", async (ctx) => {
	const channelEmitter = new StandaloneChannelEmitter(iframe, {}, {});

	const onMessageStub = vi.fn();
	// @ts-expect-error - taking a shortcut by accessing protected property
	vi.spyOn(channelEmitter, "onMessage").mockImplementation(onMessageStub);
	// @ts-expect-error - taking a shortcut by setting private property
	channelEmitter._ready = true;

	const response = createSuccessResponseMessage(ctx.meta.name, undefined);

	// @ts-expect-error - taking a shortcut by accessing private property
	await channelEmitter._onPublicMessage({
		data: response,
		source: iframe.contentWindow,
	});

	expect(onMessageStub).not.toHaveBeenCalled();
});
