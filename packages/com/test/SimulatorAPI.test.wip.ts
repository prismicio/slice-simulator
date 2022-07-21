import { it, expect } from "vitest";
import * as sinon from "sinon";

import { createRequestMessage } from "../src/channel";
import {
	APIRequestType,
	APITransactions,
	ClientRequestType,
	SimulatorAPI,
} from "../src";

it("instantiates correctly", (t) => {
	t.notThrows(
		() =>
			new SimulatorAPI({
				[ClientRequestType.Ping]: (_req, res) => {
					return res.success("pong");
				},
				[ClientRequestType.GetLibraries]: (_req, res) => {
					return res.success([]);
				},
				[ClientRequestType.SetSliceZone]: (_req, res) => {
					return res.success();
				},
				[ClientRequestType.SetSliceZoneFromSliceIDs]: (_req, res) => {
					return res.success();
				},
				[ClientRequestType.ScrollToSlice]: (_req, res) => {
					return res.success();
				},
			}),
	);
});

it("instantiates correctly with defaults", (t) => {
	const simulatorAPI = new SimulatorAPI({
		[ClientRequestType.GetLibraries]: (_req, res) => {
			return res.success([]);
		},
		[ClientRequestType.SetSliceZone]: (_req, res) => {
			return res.success();
		},
		[ClientRequestType.SetSliceZoneFromSliceIDs]: (_req, res) => {
			return res.success();
		},
		[ClientRequestType.ScrollToSlice]: (_req, res) => {
			return res.success();
		},
	});

	const [req, res] = [
		createRequestMessage(ClientRequestType.Ping, undefined),
		{
			success: sinon.spy(),
			error: sinon.spy(),
		},
	];

	simulatorAPI.requestHandlers[ClientRequestType.Ping](req, res);

	t.is(res.success.callCount, 1);
	t.is(res.error.callCount, 0);
});

it("registers instance on window object", (t) => {
	t.false("prismic" in window);

	const simulatorClient = new SimulatorAPI(
		{
			[ClientRequestType.GetLibraries]: (_req, res) => {
				return res.success([]);
			},
			[ClientRequestType.SetSliceZone]: (_req, res) => {
				return res.success();
			},
			[ClientRequestType.SetSliceZoneFromSliceIDs]: (_req, res) => {
				return res.success();
			},
			[ClientRequestType.ScrollToSlice]: (_req, res) => {
				return res.success();
			},
		},
		{ debug: true },
	);

	type APIWindow = typeof window & {
		prismic?: { sliceSimulator: { api: SimulatorAPI[] } };
	};

	t.is((window as APIWindow).prismic?.sliceSimulator.api[0], simulatorClient);

	delete (window as APIWindow).prismic;
});

const callsPostFormattedRequestCorrectly = async <
	TRequestType extends APIRequestType,
>(
	t: ExecutionContext,
	requestType: TRequestType,
	requestData: APITransactions[TRequestType]["request"]["data"],
) => {
	const simulatorAPI = new SimulatorAPI({
		[ClientRequestType.GetLibraries]: (_req, res) => {
			return res.success([]);
		},
		[ClientRequestType.SetSliceZone]: (_req, res) => {
			return res.success();
		},
		[ClientRequestType.SetSliceZoneFromSliceIDs]: (_req, res) => {
			return res.success();
		},
		[ClientRequestType.ScrollToSlice]: (_req, res) => {
			return res.success();
		},
	});

	const postFormattedRequestStub = sinon.stub(
		simulatorAPI,
		// @ts-expect-error - taking a shortcut by accessing protected property
		"postFormattedRequest",
	);

	await simulatorAPI[requestType](requestData);

	t.is(postFormattedRequestStub.callCount, 1);
	t.is(postFormattedRequestStub.getCall(0).args[0], requestType);
	t.is(postFormattedRequestStub.getCall(0).args[1], requestData);

	postFormattedRequestStub.restore();
};
callsPostFormattedRequestCorrectly.title = <
	TRequestType extends APIRequestType,
>(
	providedTitle = "",
	requestType: TRequestType,
	_requestData: APITransactions[TRequestType]["request"]["data"],
) =>
	providedTitle ||
	`\`SimulatorAPI.${requestType}()\` calls \`postFormattedRequest\` correctly`;

/* eslint-disable prettier/prettier */

it(callsPostFormattedRequestCorrectly, APIRequestType.SetActiveSlice, null);

/* eslint-enable prettier/prettier */
