import { LibrarySummary } from "@prismicio/slice-canvas-renderer";

import { AllChannelReceiverOptions, ChannelReceiver } from "./channel";
import { ClientRequestType, ClientTransactions } from "./types";

export type ForeignHandlers = {
	[ClientRequestType.GetLibraries]: (
		request: ClientTransactions[ClientRequestType.GetLibraries]["request"],
	) => LibrarySummary[];

	[ClientRequestType.SetSliceZone]: (
		request: ClientTransactions[ClientRequestType.SetSliceZone]["request"],
	) => void;

	[ClientRequestType.SetSliceZoneFromSliceIDs]: (
		request: ClientTransactions[ClientRequestType.SetSliceZoneFromSliceIDs]["request"],
	) => void;
};

export const rendererAPIDefaultOptions: Partial<AllChannelReceiverOptions> = {
	requestIDPrefix: "renderer-",
};

export class RendererAPI extends ChannelReceiver<ClientTransactions> {
	constructor(
		requestHandlers: ForeignHandlers,
		options: Partial<AllChannelReceiverOptions>,
	) {
		super(
			{
				[ClientRequestType.Ping]: (request) => {
					return this.postSuccessResponse(request.requestID, "pong");
				},
				[ClientRequestType.GetLibraries]: (request) => {
					return this.postSuccessResponse(
						request.requestID,
						requestHandlers[request.type](request),
					);
				},
				[ClientRequestType.SetSliceZone]: (request) => {
					return this.postSuccessResponse(
						request.requestID,
						requestHandlers[request.type](request),
					);
				},
				[ClientRequestType.SetSliceZoneFromSliceIDs]: (request) => {
					return this.postSuccessResponse(
						request.requestID,
						requestHandlers[request.type](request),
					);
				},
			},
			{ ...rendererAPIDefaultOptions, ...options },
		);
	}
}
