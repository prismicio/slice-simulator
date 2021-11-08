import test from "ava";

import { ChannelNetwork, createSuccessResponseMessage } from "../src/channel";

class StandaloneChannelNetwork extends ChannelNetwork {}

const dummyData = { foo: "bar" };

test("uses provided post message method", (t) => {
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
