import {
	ChannelEmitter,
	TransactionMethod,
	AllChannelEmitterOptions,
	TransactionsMethods,
} from "./channel";
import {
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
		options?: Partial<AllChannelEmitterOptions>,
	) {
		super(target, {}, { ...rendererClientDefaultOptions, ...options });
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
}
