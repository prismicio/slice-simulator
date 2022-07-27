import {
	ChannelEmitter,
	TransactionMethod,
	AllChannelEmitterOptions,
	TransactionsMethods,
	TransactionsHandlers,
} from "./channel";
import { SimulatorAPIOptions } from "./SimulatorAPI";
import {
	APIRequestType,
	APITransactions,
	ClientRequestType,
	ClientTransactions,
} from "./types";

export const simulatorClientDefaultOptions: Partial<AllChannelEmitterOptions> =
	{
		requestIDPrefix: "client-",
	};

export class SimulatorClient
	extends ChannelEmitter<
		APITransactions,
		Partial<AllChannelEmitterOptions>,
		SimulatorAPIOptions
	>
	implements TransactionsMethods<ClientTransactions>
{
	constructor(
		target: HTMLIFrameElement,
		requestHandlers?: Partial<TransactionsHandlers<APITransactions>>,
		options?: Partial<AllChannelEmitterOptions>,
	) {
		// True if `options.debug` is true or `debug=true` is among query parameters
		const debug =
			options?.debug ||
			/[\?&]debug=true/i.test(decodeURIComponent(window.location.search));

		super(
			target,
			{
				[APIRequestType.SetActiveSlice]: (_req, res) => {
					return res.success();
				},
				...requestHandlers,
			},
			{
				...simulatorClientDefaultOptions,
				...options,
				debug,
			},
		);

		// Append client to window object
		if (debug) {
			type ClientWindow = typeof window & {
				prismic: { sliceSimulator?: { client?: SimulatorClient[] } };
			};

			(window as ClientWindow).prismic ||= {};
			(window as ClientWindow).prismic.sliceSimulator ||= {};
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			(window as ClientWindow).prismic.sliceSimulator!.client ||= [];
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			(window as ClientWindow).prismic.sliceSimulator!.client!.push(this);
		}
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
