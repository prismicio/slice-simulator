import {
	AllChannelReceiverOptions,
	ChannelReceiver,
	TransactionsHandlers,
} from "./channel";
import { ClientRequestType, ClientTransactions } from "./types";

export const rendererAPIDefaultOptions: Partial<AllChannelReceiverOptions> = {
	requestIDPrefix: "renderer-",
};

export class RendererAPI extends ChannelReceiver<ClientTransactions> {
	constructor(
		requestHandlers: Omit<
			TransactionsHandlers<ClientTransactions>,
			ClientRequestType.Ping
		> &
			Partial<
				Pick<TransactionsHandlers<ClientTransactions>, ClientRequestType.Ping>
			>,
		options?: Partial<AllChannelReceiverOptions>,
	) {
		super(
			{
				[ClientRequestType.Ping]:
					requestHandlers[ClientRequestType.Ping] ||
					((_req, res) => {
						return res.success("pong");
					}),
				...requestHandlers,
			},
			{
				...rendererAPIDefaultOptions,
				// True if `debug=true` is among query parameters
				debug: /[\?&]debug=true/i.test(
					decodeURIComponent(window.location.search),
				),
				...options,
			},
		);
	}
}
