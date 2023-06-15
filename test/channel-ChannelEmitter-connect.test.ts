import { expect, it, vi } from "vitest";

import {
	ChannelEmitter,
	ConnectionTimeoutError,
	UnknownMessage,
	createSuccessResponseMessage,
	isRequestMessage,
	validateMessage,
} from "../src/channel";

class StandaloneChannelEmitter extends ChannelEmitter {}

// Using `div` tag instead of `iframe` to allow setting `contentWindow` property
const iframe = document.createElement("div") as HTMLIFrameElement;
// @ts-expect-error - setting for test purpose
iframe.contentWindow = window;

const dummyData = { foo: "bar" };

it("throws when target window is not available", async () => {
	const iframe = document.createElement("iframe");

	const channelEmitter = new StandaloneChannelEmitter(iframe, {}, {});

	setTimeout(() => {
		iframe.dispatchEvent(new Event("load"));
	}, 10);
	await expect(channelEmitter.connect()).rejects.toThrowError(
		"Target window is not available",
	);
});

it("timeouts after set timeout", async () => {
	const channelEmitter = new StandaloneChannelEmitter(
		iframe,
		{},
		{ connectTimeout: 100 },
	);

	setTimeout(() => {
		iframe.dispatchEvent(new Event("load"));
	}, 10);
	await expect(channelEmitter.connect()).rejects.toThrowError(
		ConnectionTimeoutError,
	);
});

it("sets `receiverReadyCallback` if `receiverReady` is not set", async () => {
	const channelEmitter = new StandaloneChannelEmitter(
		iframe,
		{},
		{ connectTimeout: 100 },
	);

	// @ts-expect-error - taking a shortcut by accessing private property
	expect(channelEmitter._receiverReadyCallback).toBe(null);

	setTimeout(() => {
		iframe.dispatchEvent(new Event("load"));
	}, 10);
	await expect(channelEmitter.connect()).rejects.toThrowError(
		ConnectionTimeoutError,
	);

	// @ts-expect-error - taking a shortcut by accessing private property
	expect(channelEmitter._receiverReadyCallback).toBeTypeOf("function");
});

it("awaits new receiver and sets `receiverReadyCallback` when `newOrigin` option is set", async (ctx) => {
	const channelEmitter = new StandaloneChannelEmitter(
		iframe,
		{},
		{ connectTimeout: 100 },
	);

	// @ts-expect-error - taking a shortcut by setting private property
	channelEmitter._receiverReady = ctx.meta.name;
	// @ts-expect-error - taking a shortcut by accessing private property
	expect(channelEmitter._receiverReadyCallback).toBe(null);

	setTimeout(() => {
		iframe.dispatchEvent(new Event("load"));
	}, 10);
	await expect(channelEmitter.connect({}, true)).rejects.toThrowError(
		ConnectionTimeoutError,
	);

	// @ts-expect-error - taking a shortcut by accessing private property
	expect(channelEmitter._receiverReady).toBe("");
	// @ts-expect-error - taking a shortcut by accessing private property
	expect(channelEmitter._receiverReadyCallback).toBeTypeOf("function");
});

it("calls `receiverReadyCallback` straight away if receiver is already ready", async (ctx) => {
	const channelEmitter = new StandaloneChannelEmitter(
		iframe,
		{},
		{ connectTimeout: 100, requestIDPrefix: ctx.meta.name },
	);

	const contentWindowBck = iframe.contentWindow;
	// @ts-expect-error - setting for test purpose
	delete iframe.contentWindow;
	const postMessageMock = vi.fn(
		(request: UnknownMessage, host?: string, ports?: [MessagePort]) => {
			if (isRequestMessage(request) && ports) {
				const response = createSuccessResponseMessage(
					request.requestID,
					undefined,
				);

				ports[0].postMessage(response);
			}
		},
	);
	// @ts-expect-error - setting for test purpose
	iframe.contentWindow = {
		postMessage: postMessageMock,
	};

	// @ts-expect-error - taking a shortcut by setting private property
	channelEmitter._receiverReady = ctx.meta.name;

	setTimeout(() => {
		iframe.dispatchEvent(new Event("load"));
	}, 10);
	const response = await channelEmitter.connect(dummyData);

	expect(
		// @ts-expect-error - taking a shortcut by accessing private property
		channelEmitter.channel instanceof MessageChannel,
		"sets message channel",
	).toBe(true);
	expect(
		postMessageMock,
		"calls `postMessage` twice: 1 for connect request, 1 for ready response",
	).toHaveBeenCalledTimes(2);
	expect(() => {
		postMessageMock.mock.calls.forEach((call) => {
			validateMessage(call[0]);
		});
	}, "calls `postMessage` with valid messages only").not.toThrowError();
	expect(
		postMessageMock.mock.calls[0][0].data,
		"calls `postMessage` with provided options",
	).toStrictEqual(dummyData);
	expect(
		response.requestID.replace(/\d+/, ""),
		"receives a valid connect response",
	).toBe(ctx.meta.name);
	expect(response.status, "receives a valid connect response").toBe(200);

	// @ts-expect-error - setting for test purpose
	iframe.contentWindow = contentWindowBck;
});
