import test from "ava";

import {
	ChannelNetwork,
	createErrorResponseMessage,
	createSuccessResponseMessage,
	RequestTimeoutError,
	ResponseError,
	TooManyConcurrentRequestsError,
	UnknownErrorResponseMessage,
} from "../src/channel";

class StandaloneChannelNetwork extends ChannelNetwork {}

const dummyData = { foo: "bar" };
const dummyError = dummyData;

test("posts valid requests to its partner and returns success response", async (t) => {
	const channelNetwork = new StandaloneChannelNetwork({}, {});

	const channel = new MessageChannel();

	// @ts-expect-error - taking a shortcut by setting protected property
	channelNetwork.port = channel.port2;

	const request = channelNetwork.createRequestMessage(t.title, dummyData);
	const response = createSuccessResponseMessage(request.requestID, dummyData);

	channel.port1.onmessage = (event) => {
		t.deepEqual(event.data, request);

		channel.port1.postMessage(response);
	};

	// @ts-expect-error - taking a shortcut by accessing protected property
	const receivedResponse = await channelNetwork.postRequest(request);

	t.deepEqual(receivedResponse, response);
});

test("posts valid requests to its partner and throws error response", async (t) => {
	const channelNetwork = new StandaloneChannelNetwork({}, {});

	const channel = new MessageChannel();

	// @ts-expect-error - taking a shortcut by setting protected property
	channelNetwork.port = channel.port2;

	const request = channelNetwork.createRequestMessage(t.title, dummyData);
	const response = createErrorResponseMessage(request.requestID, dummyError);

	channel.port1.onmessage = (event) => {
		t.deepEqual(event.data, request);

		channel.port1.postMessage(response);
	};

	const error = await t.throwsAsync<ResponseError<UnknownErrorResponseMessage>>(
		// @ts-expect-error - taking a shortcut by accessing protected property
		channelNetwork.postRequest(request),
		{
			instanceOf: ResponseError,
			message: response.msg,
		},
	);

	t.deepEqual(error.response, response);
});

test("posts valid requests to its partner and timeout after set default timeout", async (t) => {
	const channelNetwork = new StandaloneChannelNetwork(
		{},
		{ defaultTimeout: 100 },
	);

	const channel = new MessageChannel();

	// @ts-expect-error - taking a shortcut by setting protected property
	channelNetwork.port = channel.port2;

	const request = channelNetwork.createRequestMessage(t.title, dummyData);

	channel.port1.onmessage = (event) => {
		t.deepEqual(event.data, request);
	};

	await new Promise<void>(async (resolve, reject) => {
		const timeout = setTimeout(() => {
			t.fail("default timeout is not honored");
			reject();
		}, 1000);

		// @ts-expect-error - taking a shortcut by accessing protected property
		await t.throwsAsync(channelNetwork.postRequest(request), {
			instanceOf: RequestTimeoutError,
		});

		clearTimeout(timeout);

		resolve();
	});
});

test("posts valid requests to its partner and timeout after set specific timeout", async (t) => {
	const channelNetwork = new StandaloneChannelNetwork({}, {});

	const channel = new MessageChannel();

	// @ts-expect-error - taking a shortcut by setting protected property
	channelNetwork.port = channel.port2;

	const request = channelNetwork.createRequestMessage(t.title, undefined);

	channel.port1.onmessage = (event) => {
		t.deepEqual(event.data, request);
	};

	await new Promise<void>(async (resolve, reject) => {
		const timeout = setTimeout(() => {
			t.fail("specific timeout is not honored");
			reject();
		}, 1000);

		await t.throwsAsync(
			// @ts-expect-error - taking a shortcut by accessing protected property
			channelNetwork.postRequest(request, undefined, { timeout: 100 }),
			{
				instanceOf: RequestTimeoutError,
			},
		);

		clearTimeout(timeout);

		resolve();
	});
});

test("throws when maximum request concurrency has been hit", async (t) => {
	const channelNetwork = new StandaloneChannelNetwork(
		{},
		{
			maximumRequestConcurrency: 5,
		},
	);

	const channel = new MessageChannel();

	// @ts-expect-error - taking a shortcut by setting protected property
	channelNetwork.port = channel.port2;

	const request = channelNetwork.createRequestMessage(t.title, dummyData);
	const response = createSuccessResponseMessage(request.requestID, dummyData);

	channel.port1.onmessage = (event) => {
		setTimeout(() => {
			channel.port1.postMessage({
				...response,
				requestID: event.data.requestID,
			});
		}, 100);
	};

	await t.throwsAsync(
		async () => {
			const promises = [];
			for (let i = 0; i < 6; i++) {
				promises.push(
					// @ts-expect-error - taking a shortcut by accessing protected property
					channelNetwork.postRequest({ ...request, requestID: `channel-${i}` }),
				);
			}

			await Promise.all(promises);
		},
		{
			instanceOf: TooManyConcurrentRequestsError,
		},
	);
});

test("uses provided post message method", async (t) => {
	const channelNetwork = new StandaloneChannelNetwork({}, {});

	const channel = new MessageChannel();

	// @ts-expect-error - taking a shortcut by setting protected property
	channelNetwork.port = channel.port2;

	const request = channelNetwork.createRequestMessage(t.title, dummyData);
	const response = createSuccessResponseMessage(request.requestID, dummyData);

	const onmessage = (event: MessageEvent<unknown>) => {
		t.deepEqual(event.data, request);

		channel.port1.postMessage(response);
	};

	// @ts-expect-error - taking a shortcut by accessing protected property
	const receivedResponse = await channelNetwork.postRequest(
		request,
		(request) => {
			onmessage({ data: request } as MessageEvent<unknown>);
		},
	);

	t.deepEqual(receivedResponse, response);
});
