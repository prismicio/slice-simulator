import { expect, it, vi } from "vitest";

import {
	ChannelNetwork,
	UnknownTransaction,
	createErrorResponseMessage,
	createRequestMessage,
	createSuccessResponseMessage,
} from "../src/channel";

class StandaloneChannelNetwork<
	TOptions extends Record<string, unknown> = Record<string, unknown>,
	TPartnerTransactions extends Record<string, UnknownTransaction> = Record<
		string,
		never
	>,
> extends ChannelNetwork<TPartnerTransactions, TOptions> {}

const dummyData = { foo: "bar" };

it("debug logs messages when on debug mode", async (ctx) => {
	vi.stubGlobal("console", { ...console, debug: vi.fn(), error: vi.fn() });

	const channelNetwork = new StandaloneChannelNetwork({}, { debug: true });

	const response = createSuccessResponseMessage(ctx.meta.name, dummyData);

	// @ts-expect-error - taking a shortcut by accessing protected property
	await channelNetwork.onMessage({ data: response });

	expect(console.debug).toHaveBeenCalledOnce();
	expect(console.debug).toHaveBeenCalledWith(response);

	vi.restoreAllMocks();
});

it("doesn't debug log messages when not on debug mode", async (ctx) => {
	vi.stubGlobal("console", { ...console, debug: vi.fn(), error: vi.fn() });

	const channelNetwork = new StandaloneChannelNetwork({}, { debug: false });

	const response = createSuccessResponseMessage(ctx.meta.name, dummyData);

	// @ts-expect-error - taking a shortcut by accessing protected property
	await channelNetwork.onMessage({ data: response });

	expect(console.debug).not.toHaveBeenCalled();

	vi.restoreAllMocks();
});

it("warns on invalid message received", async () => {
	vi.stubGlobal("console", { ...console, warn: vi.fn() });

	const channelNetwork = new StandaloneChannelNetwork({}, {});

	// @ts-expect-error - taking a shortcut by accessing protected property
	await channelNetwork.onMessage({ data: {} });

	expect(console.warn).toHaveBeenCalledOnce();

	vi.restoreAllMocks();
});

it("throws on other errors", async (ctx) => {
	const channelNetwork = new StandaloneChannelNetwork({}, {});

	// @ts-expect-error - taking a shortcut by accessing private property
	vi.spyOn(channelNetwork._pendingRequests, "has").mockImplementation(() => {
		throw new Error(ctx.meta.name);
	});

	const response = createSuccessResponseMessage(ctx.meta.name, dummyData);

	await expect(
		// @ts-expect-error - taking a shortcut by accessing protected property
		channelNetwork.onMessage({ data: response }),
	).rejects.toThrowError(ctx.meta.name);
});

it("returns request handler success response", async (ctx) => {
	const channelNetwork = new StandaloneChannelNetwork<
		Record<string, unknown>,
		{ foo: UnknownTransaction }
	>(
		{
			foo: (_req, res) => res.success(ctx.meta.name),
		},
		{},
	);

	const channel = new MessageChannel();

	// @ts-expect-error - taking a shortcut by setting protected property
	channelNetwork.port = channel.port2;

	await new Promise<void>((resolve, reject) => {
		const timeout = setTimeout(() => {
			reject();
		}, 1000);

		const request = createRequestMessage("foo", dummyData);
		const response = createSuccessResponseMessage(
			request.requestID,
			ctx.meta.name,
		);

		channel.port1.onmessage = (event) => {
			expect(event.data).toStrictEqual(response);
			clearTimeout(timeout);
			resolve();
		};
		channel.port1.postMessage(request);
	});

	expect.assertions(1);
});

it("returns request handler error response", async (ctx) => {
	const channelNetwork = new StandaloneChannelNetwork<
		Record<string, unknown>,
		{ foo: UnknownTransaction }
	>(
		{
			foo: (_req, res) => res.error(ctx.meta.name),
		},
		{},
	);

	const channel = new MessageChannel();

	// @ts-expect-error - taking a shortcut by setting protected property
	channelNetwork.port = channel.port2;

	await new Promise<void>((resolve, reject) => {
		const timeout = setTimeout(() => {
			reject();
		}, 1000);

		const request = createRequestMessage("foo", dummyData);
		const response = createErrorResponseMessage(
			request.requestID,
			ctx.meta.name,
		);

		channel.port1.onmessage = (event) => {
			expect(event.data).toStrictEqual(response);
			clearTimeout(timeout);
			resolve();
		};
		channel.port1.postMessage(request);
	});

	expect.assertions(1);
});

it("returns not implemented when request handler is not found", async (ctx) => {
	const channelNetwork = new StandaloneChannelNetwork({}, {});

	const channel = new MessageChannel();

	// @ts-expect-error - taking a shortcut by setting protected property
	channelNetwork.port = channel.port2;

	await new Promise<void>((resolve, reject) => {
		const timeout = setTimeout(() => {
			reject();
		}, 1000);

		const request = createRequestMessage(ctx.meta.name, dummyData);
		const response = createErrorResponseMessage(
			request.requestID,
			undefined,
			501,
		);

		channel.port1.onmessage = (event) => {
			expect(event.data).toStrictEqual(response);
			clearTimeout(timeout);
			resolve();
		};
		channel.port1.postMessage(request);
	});

	expect.assertions(1);
});

it("returns internal server error when handler throws", async (ctx) => {
	const channelNetwork = new StandaloneChannelNetwork<
		Record<string, unknown>,
		{ foo: UnknownTransaction }
	>(
		{
			foo: (_req, _res) => {
				throw new Error(ctx.meta.name);
			},
		},
		{},
	);

	const channel = new MessageChannel();

	// @ts-expect-error - taking a shortcut by setting protected property
	channelNetwork.port = channel.port2;

	await new Promise<void>((resolve, reject) => {
		const timeout = setTimeout(() => {
			reject();
		}, 1000);

		const request = createRequestMessage("foo", dummyData);
		const response = createErrorResponseMessage(
			request.requestID,
			new Error(ctx.meta.name),
			500,
		);

		channel.port1.onmessage = (event) => {
			expect(event.data).toStrictEqual(response);
			clearTimeout(timeout);
			resolve();
		};
		channel.port1.postMessage(request);
	});

	expect.assertions(1);
});

it("logs error when unknown request ID is received", async (ctx) => {
	vi.stubGlobal("console", { ...console, error: vi.fn() });

	const channelNetwork = new StandaloneChannelNetwork({}, { debug: false });

	const response = createSuccessResponseMessage(ctx.meta.name, dummyData);

	// @ts-expect-error - taking a shortcut by accessing protected property
	await channelNetwork.onMessage({ data: response });

	expect(console.error).toHaveBeenCalledOnce();
	expect(
		vi.mocked(console.error).mock.calls[0][0].includes(response.requestID),
	).toBe(true);

	vi.restoreAllMocks();
});
