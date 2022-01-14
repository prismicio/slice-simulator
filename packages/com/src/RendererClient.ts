import {
	ChannelEmitter,
	TransactionMethod,
	AllChannelEmitterOptions,
	TransactionsMethods,
	TransactionsHandlers,
} from "./channel";
import {
	APIRequestType,
	APITransactions,
	ClientRequestType,
	ClientTransactions,
} from "./types";

export const rendererClientDefaultOptions: Partial<AllChannelEmitterOptions> = {
	requestIDPrefix: "client-",
};

export class RendererClient
	extends ChannelEmitter<APITransactions>
	implements TransactionsMethods<ClientTransactions>
{
	constructor(
		target: HTMLIFrameElement,
		requestHandlers?: Partial<TransactionsHandlers<APITransactions>>,
		options?: Partial<AllChannelEmitterOptions>,
	) {
		super(
			target,
			{
				[APIRequestType.SetActiveSlice]: (_req, res) => {
					return res.success();
				},
				...requestHandlers,
			},
			{ ...rendererClientDefaultOptions, ...options },
		);
	}

	[ClientRequestType.Ping]: TransactionMethod<
		ClientTransactions[ClientRequestType.Ping]
	> = async () => {
		return await this.postFormattedRequest(ClientRequestType.Ping);
	};

	[ClientRequestType.GetLibraries]: TransactionMethod<
		ClientTransactions[ClientRequestType.GetLibraries]
	> = async () => {
		return await this.postFormattedRequest(ClientRequestType.GetLibraries);
	};

	[ClientRequestType.SetSliceZone]: TransactionMethod<
		ClientTransactions[ClientRequestType.SetSliceZone]
	> = async (data) => {
		return await this.postFormattedRequest(
			ClientRequestType.SetSliceZone,
			data,
		);
	};

	[ClientRequestType.SetSliceZoneFromSliceIDs]: TransactionMethod<
		ClientTransactions[ClientRequestType.SetSliceZoneFromSliceIDs]
	> = async (data) => {
		return await this.postFormattedRequest(
			ClientRequestType.SetSliceZoneFromSliceIDs,
			data,
		);
	};

	[ClientRequestType.ScrollToSlice]: TransactionMethod<
		ClientTransactions[ClientRequestType.ScrollToSlice]
	> = async (data) => {
		return await this.postFormattedRequest(
			ClientRequestType.ScrollToSlice,
			data,
		);
	};
}
