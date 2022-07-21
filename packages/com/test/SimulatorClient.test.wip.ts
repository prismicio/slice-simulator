import { it, expect } from "vitest";
import * as sinon from "sinon";

import { createRequestMessage } from "../src/channel";
import {
	APIRequestType,
	ClientRequestType,
	ClientTransactions,
	SimulatorClient,
} from "../src";

const iframe = document.createElement("iframe");

it("instantiates correctly", (t) => {
	t.notThrows(
		() =>
			new SimulatorClient(iframe, {
				[APIRequestType.SetActiveSlice]: (_req, res) => {
					return res.success();
				},
			}),
	);
});

it("instantiates correctly with defaults", (t) => {
	const simulatorClient = new SimulatorClient(iframe);

	const [req, res] = [
		createRequestMessage(APIRequestType.SetActiveSlice, null),
		{
			success: sinon.spy(),
			error: sinon.spy(),
		},
	];

	simulatorClient.requestHandlers[APIRequestType.SetActiveSlice](req, res);

	t.is(res.success.callCount, 1);
	t.is(res.error.callCount, 0);
});

it("registers instance on window object", (t) => {
	t.false("prismic" in window);

	const simulatorClient = new SimulatorClient(iframe, {}, { debug: true });

	type ClientWindow = typeof window & {
		prismic?: { sliceSimulator: { client: SimulatorClient[] } };
	};

	t.is(
		(window as ClientWindow).prismic?.sliceSimulator.client[0],
		simulatorClient,
	);

	delete (window as ClientWindow).prismic;
});

const callsPostFormattedRequestCorrectly = async <
	TRequestType extends ClientRequestType,
>(
	t: ExecutionContext,
	requestType: TRequestType,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	requestData: ClientTransactions[TRequestType]["request"]["data"],
) => {
	const simulatorClient = new SimulatorClient(iframe);

	const postFormattedRequestStub = sinon.stub(
		simulatorClient,
		// @ts-expect-error - taking a shortcut by accessing protected property
		"postFormattedRequest",
	);

	// @ts-expect-error - cannot provide "void" type generically
	await simulatorClient[requestType](requestData);

	t.is(postFormattedRequestStub.callCount, 1);
	t.is(postFormattedRequestStub.getCall(0).args[0], requestType);
	t.is(postFormattedRequestStub.getCall(0).args[1], requestData);

	postFormattedRequestStub.restore();
};
callsPostFormattedRequestCorrectly.title = <
	TRequestType extends ClientRequestType,
>(
	providedTitle = "",
	requestType: TRequestType,
	_requestData: ClientTransactions[TRequestType]["request"]["data"],
) =>
	providedTitle ||
	`\`SimulatorClient.${requestType}()\` calls \`postFormattedRequest\` correctly`;

/* eslint-disable prettier/prettier */

it(callsPostFormattedRequestCorrectly, ClientRequestType.Ping, undefined);
it(callsPostFormattedRequestCorrectly, ClientRequestType.GetLibraries, undefined);
it(callsPostFormattedRequestCorrectly, ClientRequestType.SetSliceZone, []);
it(callsPostFormattedRequestCorrectly, ClientRequestType.SetSliceZoneFromSliceIDs, []);
it(callsPostFormattedRequestCorrectly, ClientRequestType.ScrollToSlice, { sliceIndex: 0});

/* eslint-enable prettier/prettier */
