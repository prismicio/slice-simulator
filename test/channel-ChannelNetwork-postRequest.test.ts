import { expect, it, vi } from "vitest";

import {
	ChannelNetwork,
	RequestTimeoutError,
	ResponseError,
	TooManyConcurrentRequestsError,
	createErrorResponseMessage,
	createSuccessResponseMessage,
} from "../src/channel";

class StandaloneChannelNetwork extends ChannelNetwork {}

const dummyData = { foo: "bar" };
const dummyError = dummyData;

it("posts valid requests to its partner and returns success response", async (ctx) => {
	const channelNetwork = new StandaloneChannelNetwork({}, {});

	const channel = new MessageChannel();

	// @ts-expect-error - taking a shortcut by setting protected property
	channelNetwork.port = channel.port2;

	const request = channelNetwork.createRequestMessage(ctx.meta.name, dummyData);
	const response = createSuccessResponseMessage(request.requestID, dummyData);

	channel.port1.onmessage = (event) => {
		expect(event.data).toStrictEqual(request);

		channel.port1.postMessage(response);
	};

	// @ts-expect-error - taking a shortcut by accessing protected property
	const receivedResponse = await channelNetwork.postRequest(request);

	expect(receivedResponse).toStrictEqual(response);
});

it("posts valid requests to its partner and throws error response", async (ctx) => {
	const channelNetwork = new StandaloneChannelNetwork({}, {});

	const channel = new MessageChannel();

	// @ts-expect-error - taking a shortcut by setting protected property
	channelNetwork.port = channel.port2;

	const request = channelNetwork.createRequestMessage(ctx.meta.name, dummyData);
	const response = createErrorResponseMessage(request.requestID, dummyError);

	channel.port1.onmessage = (event) => {
		expect(event.data).toStrictEqual(request);

		channel.port1.postMessage(response);
	};

	try {
		// @ts-expect-error - taking a shortcut by accessing protected property
		await channelNetwork.postRequest(request);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		expect(error).toBeInstanceOf(ResponseError);
		expect(error.message).toBe(response.msg);
		expect(error.response).toStrictEqual(response);
	}
});

it("posts valid requests to its partner and timeout after set default timeout", async (ctx) => {
	const channelNetwork = new StandaloneChannelNetwork(
		{},
		{ defaultTimeout: 100 },
	);

	const channel = new MessageChannel();

	// @ts-expect-error - taking a shortcut by setting protected property
	channelNetwork.port = channel.port2;

	const request = channelNetwork.createRequestMessage(ctx.meta.name, dummyData);

	channel.port1.onmessage = (event) => {
		expect(event.data).toStrictEqual(request);
	};

	await new Promise<void>(async (resolve, reject) => {
		const timeout = setTimeout(() => {
			reject();
		}, 1000);

		// @ts-expect-error - taking a shortcut by accessing protected property
		await expect(channelNetwork.postRequest(request)).rejects.toThrowError(
			RequestTimeoutError,
		);

		clearTimeout(timeout);

		resolve();
	});

	expect.assertions(2);
});

it("posts valid requests to its partner and timeout after set specific timeout", async (ctx) => {
	const channelNetwork = new StandaloneChannelNetwork({}, {});

	const channel = new MessageChannel();

	// @ts-expect-error - taking a shortcut by setting protected property
	channelNetwork.port = channel.port2;

	const request = channelNetwork.createRequestMessage(ctx.meta.name, undefined);

	channel.port1.onmessage = (event) => {
		expect(event.data).toStrictEqual(request);
	};

	await new Promise<void>(async (resolve, reject) => {
		const timeout = setTimeout(() => {
			reject();
		}, 1000);

		await expect(
			// @ts-expect-error - taking a shortcut by accessing protected property
			channelNetwork.postRequest(request, undefined, { timeout: 100 }),
		).rejects.toThrowError(RequestTimeoutError);

		clearTimeout(timeout);

		resolve();
	});

	expect.assertions(2);
});

// Not sure about how that behavior is possible, reads absurd
it("posts valid requests to its partner and timeout even if pending request cannot be found", async (ctx) => {
	const channelNetwork = new StandaloneChannelNetwork(
		{},
		{ defaultTimeout: 100 },
	);

	const channel = new MessageChannel();

	// @ts-expect-error - taking a shortcut by setting protected property
	channelNetwork.port = channel.port2;

	const request = channelNetwork.createRequestMessage(ctx.meta.name, dummyData);

	channel.port1.onmessage = (event) => {
		expect(event.data).toStrictEqual(request);
		// @ts-expect-error - taking a shortcut by accessing private property
		channelNetwork._pendingRequests.delete(request.requestID);
	};

	await new Promise<void>(async (resolve, reject) => {
		const timeout = setTimeout(() => {
			reject();
		}, 1000);

		// @ts-expect-error - taking a shortcut by accessing protected property
		await expect(channelNetwork.postRequest(request)).rejects.toThrowError(
			RequestTimeoutError,
		);

		clearTimeout(timeout);

		resolve();
	});

	expect.assertions(2);
});

it("throws when maximum request concurrency has been hit", async (ctx) => {
	const channelNetwork = new StandaloneChannelNetwork(
		{},
		{
			maximumRequestConcurrency: 5,
		},
	);

	const channel = new MessageChannel();

	// @ts-expect-error - taking a shortcut by setting protected property
	channelNetwork.port = channel.port2;

	const request = channelNetwork.createRequestMessage(ctx.meta.name, dummyData);
	const response = createSuccessResponseMessage(request.requestID, dummyData);

	channel.port1.onmessage = (event) => {
		setTimeout(() => {
			channel.port1.postMessage({
				...response,
				requestID: event.data.requestID,
			});
		}, 100);
	};

	await expect(async () => {
		const promises = [];
		for (let i = 0; i < 6; i++) {
			promises.push(
				// @ts-expect-error - taking a shortcut by accessing protected property
				channelNetwork.postRequest({ ...request, requestID: `channel-${i}` }),
			);
		}

		await Promise.all(promises);
	}).rejects.toThrowError(TooManyConcurrentRequestsError);
});

it("uses provided post message method", async (ctx) => {
	const channelNetwork = new StandaloneChannelNetwork({}, {});

	const channel = new MessageChannel();

	// @ts-expect-error - taking a shortcut by setting protected property
	channelNetwork.port = channel.port2;

	const request = channelNetwork.createRequestMessage(ctx.meta.name, dummyData);
	const response = createSuccessResponseMessage(request.requestID, dummyData);

	const onmessage = (event: MessageEvent<unknown>) => {
		expect(event.data).toStrictEqual(request);

		channel.port1.postMessage(response);
	};

	// @ts-expect-error - taking a shortcut by accessing protected property
	const receivedResponse = await channelNetwork.postRequest(
		request,
		(request) => {
			onmessage({ data: request } as MessageEvent<unknown>);
		},
	);

	expect(receivedResponse).toStrictEqual(response);
});

it("debug logs messages when on debug mode", async (ctx) => {
	vi.stubGlobal("console", { ...console, debug: vi.fn() });

	const channelNetwork = new StandaloneChannelNetwork({}, { debug: true });

	const channel = new MessageChannel();

	// @ts-expect-error - taking a shortcut by setting protected property
	channelNetwork.port = channel.port2;

	const request = channelNetwork.createRequestMessage(ctx.meta.name, dummyData);
	const response = createSuccessResponseMessage(request.requestID, dummyData);

	channel.port1.onmessage = () => {
		channel.port1.postMessage(response);
	};

	// @ts-expect-error - taking a shortcut by accessing protected property
	await channelNetwork.postRequest(request);

	// Request and response are actually logged...
	expect(console.debug).toHaveBeenCalledTimes(2);

	vi.restoreAllMocks();
});

it("doesn't debug log messages when not on debug mode", async (ctx) => {
	vi.stubGlobal("console", { ...console, debug: vi.fn() });

	const channelNetwork = new StandaloneChannelNetwork({}, { debug: false });

	const channel = new MessageChannel();

	// @ts-expect-error - taking a shortcut by setting protected property
	channelNetwork.port = channel.port2;

	const request = channelNetwork.createRequestMessage(ctx.meta.name, dummyData);
	const response = createSuccessResponseMessage(request.requestID, dummyData);

	channel.port1.onmessage = () => {
		channel.port1.postMessage(response);
	};

	// @ts-expect-error - taking a shortcut by accessing protected property
	await channelNetwork.postRequest(request);

	expect(console.debug).not.toHaveBeenCalled();

	vi.restoreAllMocks();
});
