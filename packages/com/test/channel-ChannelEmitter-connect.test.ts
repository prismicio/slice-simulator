import test from "ava";
import * as sinon from "sinon";

import {
	ChannelEmitter,
	ConnectionTimeoutError,
	createSuccessResponseMessage,
	isRequestMessage,
	UnknownMessage,
	validateMessage,
} from "../src/channel";

class StandaloneChannelEmitter extends ChannelEmitter {}

// Using `div` tag instead of `iframe` to allow setting `contentWindow` property
const iframe = document.createElement("div") as HTMLIFrameElement;
// @ts-expect-error - setting for test purpose
iframe.contentWindow = window;

test("throws when target window is not available", async (t) => {
	const iframe = document.createElement("iframe");

	const channelEmitter = new StandaloneChannelEmitter(iframe, {});

	setTimeout(() => {
		iframe.dispatchEvent(new Event("load"));
	}, 10);
	await t.throwsAsync(channelEmitter.connect(), {
		message: "Target window is not available",
	});
});

test("timeouts after set timeout", async (t) => {
	const channelEmitter = new StandaloneChannelEmitter(
		iframe,
		{},
		{ connectTimeout: 100 },
	);

	setTimeout(() => {
		iframe.dispatchEvent(new Event("load"));
	}, 10);
	await t.throwsAsync(channelEmitter.connect(), {
		instanceOf: ConnectionTimeoutError,
	});
});

test("sets `receiverReadyCallback` if `receiverReady` is not set", async (t) => {
	const channelEmitter = new StandaloneChannelEmitter(
		iframe,
		{},
		{ connectTimeout: 100 },
	);

	// @ts-expect-error - taking a shortcut by accessing private property
	t.is(channelEmitter._receiverReadyCallback, null);

	setTimeout(() => {
		iframe.dispatchEvent(new Event("load"));
	}, 10);
	await t.throwsAsync(channelEmitter.connect(), {
		instanceOf: ConnectionTimeoutError,
	});

	// @ts-expect-error - taking a shortcut by accessing private property
	t.is(typeof channelEmitter._receiverReadyCallback, "function");
});

test("awaits new receiver and sets `receiverReadyCallback` when `newOrigin` option is set", async (t) => {
	const channelEmitter = new StandaloneChannelEmitter(
		iframe,
		{},
		{ connectTimeout: 100 },
	);

	// @ts-expect-error - taking a shortcut by setting private property
	channelEmitter._receiverReady = t.title;
	// @ts-expect-error - taking a shortcut by accessing private property
	t.is(channelEmitter._receiverReadyCallback, null);

	setTimeout(() => {
		iframe.dispatchEvent(new Event("load"));
	}, 10);
	await t.throwsAsync(channelEmitter.connect(true), {
		instanceOf: ConnectionTimeoutError,
	});

	// @ts-expect-error - taking a shortcut by accessing private property
	t.is(channelEmitter._receiverReady, "");
	// @ts-expect-error - taking a shortcut by accessing private property
	t.is(typeof channelEmitter._receiverReadyCallback, "function");
});

test.serial(
	"calls `receiverReadyCallback` straight away if receiver is already ready",
	async (t) => {
		const channelEmitter = new StandaloneChannelEmitter(
			iframe,
			{},
			{ connectTimeout: 100, requestIDPrefix: t.title },
		);

		const contentWindowBck = iframe.contentWindow;
		// @ts-expect-error - setting for test purpose
		delete iframe.contentWindow;
		const postMessageMock = sinon.spy(
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
		channelEmitter._receiverReady = t.title;

		setTimeout(() => {
			iframe.dispatchEvent(new Event("load"));
		}, 10);
		const response = await channelEmitter.connect();

		t.true(
			// @ts-expect-error - taking a shortcut by accessing private property
			channelEmitter.channel instanceof MessageChannel,
			"sets message channel",
		);
		t.is(
			postMessageMock.callCount,
			2,
			"calls `postMessage` twice: 1 for connect request, 1 for ready response",
		);
		t.notThrows(() => {
			postMessageMock.getCalls().forEach((call) => {
				validateMessage(call.args[0]);
			});
		}, "calls `postMessage` with valid messages only");
		t.is(
			response.requestID.replace(/\d+/, ""),
			t.title,
			"receives a valid connect response",
		);
		t.is(response.status, 200, "receives a valid connect response");

		// @ts-expect-error - setting for test purpose
		iframe.contentWindow = contentWindowBck;
	},
);
