import test from "ava";
import * as sinon from "sinon";

import { ChannelEmitter, NotReadyError } from "../src/channel";

class StandaloneChannelEmitter extends ChannelEmitter {}

const iframe = document.createElement("iframe");

const dummyData = { foo: "bar" };

test("throws when not ready", (t) => {
	const channelEmitter = new StandaloneChannelEmitter(iframe, {});

	t.throws(
		() => {
			// @ts-expect-error - taking a shortcut by accessing protected property
			channelEmitter.postFormattedRequest(t.title, dummyData);
		},
		{ instanceOf: NotReadyError },
	);
});

test("forwards request to default post request handler once ready", (t) => {
	const channelEmitter = new StandaloneChannelEmitter(
		iframe,
		{},
		{ requestIDPrefix: t.title },
	);
	// @ts-expect-error - taking a shortcut by accessing protected property
	const postRequestStub = sinon.stub(channelEmitter, "postRequest");
	// @ts-expect-error - taking a shortcut by setting private property
	channelEmitter._connected = true;

	// @ts-expect-error - taking a shortcut by accessing protected property
	channelEmitter.postFormattedRequest(t.title, dummyData, { timeout: 1000 });

	t.is(postRequestStub.callCount, 1);
	t.is(
		postRequestStub.getCall(0).args[0].requestID.replace(/\d+/, ""),
		t.title,
	);
	t.is(postRequestStub.getCall(0).args[0].type, t.title);
	t.deepEqual(postRequestStub.getCall(0).args[0].data, dummyData);
	t.is(postRequestStub.getCall(0).args[1], undefined);
	t.deepEqual(postRequestStub.getCall(0).args[2], { timeout: 1000 });

	postRequestStub.restore();
});
