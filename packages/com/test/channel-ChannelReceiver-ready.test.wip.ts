import { it, expect } from "vitest";
import * as sinon from "sinon";

import {
	ChannelReceiver,
	createSuccessResponseMessage,
	UnknownRequestMessage,
} from "../src/channel";

class StandaloneChannelReceiver extends ChannelReceiver {}

it("throws when not embedded as an iframe", async (t) => {
	const channelReceiver = new StandaloneChannelReceiver({});

	await t.throwsAsync(channelReceiver.ready(), {
		instanceOf: Error,
		message: "Receiver is currently not embedded as an iframe",
	});
});

test.serial("sends ready request when embedded as an iframe", async (t) => {
	const channelReceiver = new StandaloneChannelReceiver(
		{},
		{ requestIDPrefix: t.title },
	);

	// Mock `window.parent.postMessage`
	let response;
	const windowParentBck = window.parent;
	// @ts-expect-error - deleting for test purpose
	delete window.parent;
	const postMessageMock = sinon.spy((request: UnknownRequestMessage) => {
		response = createSuccessResponseMessage(request.requestID, undefined);
		// @ts-expect-error - taking a shortcut by accessing private property
		channelReceiver._onPublicMessage({ data: response });
	});
	window.parent = {
		postMessage: postMessageMock as Window["postMessage"],
	} as Window["parent"];

	t.deepEqual(await channelReceiver.ready(), response);
	t.true(postMessageMock.calledOnce);
	// @ts-expect-error - taking a shortcut by accessing private property
	t.true(channelReceiver._ready);

	window.parent = windowParentBck;
});
