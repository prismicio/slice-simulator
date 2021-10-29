import {
	ChannelNetwork,
	ChannelNetworkOptions,
	PostRequestOptions,
} from "./ChannelNetwork";
import {
	createSuccessResponseMessage,
	validateMessage,
	isRequestMessage,
} from "./message";
import { NotReadyError } from "./errors";
import {
	SuccessResponseMessage,
	UnknownRequestMessage,
	UnknownResponseMessage,
	UnknownTransaction,
	TransactionsHandlers,
	ReceiverRequestType,
	ExtractSuccessResponseMessage,
} from "./types";

export type ChannelReceiverOptions = Record<string, unknown>;

export const channelReceiverDefaultOptions: ChannelReceiverOptions &
	Partial<ChannelNetworkOptions> = {
	requestIDPrefix: "receiver-",
};

export type AllChannelReceiverOptions = ChannelReceiverOptions &
	ChannelNetworkOptions;

export abstract class ChannelReceiver<
	TEmitterTransactions extends Record<string, UnknownTransaction> = Record<
		string,
		never
	>,
> extends ChannelNetwork<ChannelReceiverOptions, TEmitterTransactions> {
	private _ready = false;

	constructor(
		requestHandlers: TransactionsHandlers<TEmitterTransactions>,
		options: Partial<AllChannelReceiverOptions>,
	) {
		super(requestHandlers, { ...channelReceiverDefaultOptions, ...options });

		window.addEventListener("message", this._onConnection.bind(this));
	}

	public async ready(): Promise<SuccessResponseMessage> {
		if (window.parent === window) {
			throw new Error("Receiver is currently not embedded as an iframe");
		}

		const request = this.createRequestMessage(
			ReceiverRequestType.Ready,
			undefined,
		);

		return await this.postRequest(request, (request) => {
			window.parent.postMessage(request, "*");
		});
	}

	private _onConnection(event: MessageEvent<unknown>) {
		if (this.options.debug) {
			// eslint-disable-next-line no-console
			console.debug(event.data);
		}

		try {
			const request = validateMessage(event.data);

			if (isRequestMessage(request)) {
				this.port = event.ports[0];

				const response = createSuccessResponseMessage(
					request.requestID,
					undefined,
				);

				this.postResponse(response);

				this._ready = true;
			}
		} catch (error) {
			if (error instanceof TypeError) {
				return console.warn(error.message);
			} else {
				throw error;
			}
		}
	}

	protected postFormattedRequest<
		TRequest extends UnknownRequestMessage,
		TResponse extends UnknownResponseMessage,
	>(
		type: TRequest["type"],
		data?: TRequest["data"],
		options: PostRequestOptions = {},
	): Promise<ExtractSuccessResponseMessage<TResponse>> {
		if (!this._ready) {
			throw new NotReadyError(
				"Receiver is not ready, use `ChannelReceiver.ready()` first",
			);
		}

		return this.postRequest(
			this.createRequestMessage(type, data),
			undefined,
			options,
		);
	}
}
