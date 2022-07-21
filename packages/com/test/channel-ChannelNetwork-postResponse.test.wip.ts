import { it, expect } from "vitest";
import * as sinon from "sinon";

import { ChannelNetwork, createSuccessResponseMessage } from "../src/channel";

class StandaloneChannelNetwork extends ChannelNetwork {}

const dummyData = { foo: "bar" };

it("uses provided post message method", (t) => {
	const channelNetwork = new StandaloneChannelNetwork({}, {});

	const response = createSuccessResponseMessage(t.title, dummyData);

	const onmessage = (event: MessageEvent<unknown>) => {
		t.deepEqual(event.data, response);
	};

	// @ts-expect-error - taking a shortcut by accessing protected property
	channelNetwork.postResponse(response, (response) => {
		onmessage({ data: response } as MessageEvent<unknown>);
	});
});

test.serial("debug logs messages when on debug mode", (t) => {
	const consoleDebugStub = sinon.stub(console, "debug");

	const channelNetwork = new StandaloneChannelNetwork({}, { debug: true });

	const response = createSuccessResponseMessage(t.title, dummyData);

	// @ts-expect-error - taking a shortcut by accessing protected property
	channelNetwork.postResponse(response, () => undefined);

	t.is(consoleDebugStub.callCount, 1);

	consoleDebugStub.restore();
});

test.serial("doesn't debug log messages when not on debug mode", (t) => {
	const consoleDebugStub = sinon.stub(console, "debug");

	const channelNetwork = new StandaloneChannelNetwork({}, { debug: false });

	const response = createSuccessResponseMessage(t.title, dummyData);

	// @ts-expect-error - taking a shortcut by accessing protected property
	channelNetwork.postResponse(response, () => undefined);

	t.is(consoleDebugStub.callCount, 0);

	consoleDebugStub.restore();
});
