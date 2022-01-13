import test, { ExecutionContext } from "ava";
import * as sinon from "sinon";

import { createRequestMessage } from "../src/channel";
import {
	APIRequestType,
	APITransactions,
	ClientRequestType,
	RendererAPI,
} from "../src";

test("instantiates correctly", (t) => {
	t.notThrows(
		() =>
			new RendererAPI({
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
			}),
	);
});

test("instantiates correctly with defaults", (t) => {
	const rendererAPI = new RendererAPI({
		[ClientRequestType.GetLibraries]: (_req, res) => {
			return res.success([]);
		},
		[ClientRequestType.SetSliceZone]: (_req, res) => {
			return res.success();
		},
		[ClientRequestType.SetSliceZoneFromSliceIDs]: (_req, res) => {
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

	rendererAPI.requestHandlers[ClientRequestType.Ping](req, res);

	t.is(res.success.callCount, 1);
	t.is(res.error.callCount, 0);
});

const callsPostFormattedRequestCorrectly = async <
	TRequestType extends APIRequestType,
>(
	t: ExecutionContext,
	requestType: TRequestType,
	requestData: APITransactions[TRequestType]["request"]["data"],
) => {
	const rendererAPI = new RendererAPI({
		[ClientRequestType.GetLibraries]: (_req, res) => {
			return res.success([]);
		},
		[ClientRequestType.SetSliceZone]: (_req, res) => {
			return res.success();
		},
		[ClientRequestType.SetSliceZoneFromSliceIDs]: (_req, res) => {
			return res.success();
		},
	});

	const postFormattedRequestStub = sinon.stub(
		rendererAPI,
		// @ts-expect-error - taking a shortcut by accessing protected property
		"postFormattedRequest",
	);

	await rendererAPI[requestType](requestData);

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
	`\`RendererAPI.${requestType}()\` calls \`postFormattedRequest\` correctly`;

/* eslint-disable prettier/prettier */

test(callsPostFormattedRequestCorrectly, APIRequestType.SetActiveSlice, null);

/* eslint-enable prettier/prettier */
