import {
	ChannelNetwork,
	ChannelNetworkOptions,
	PostRequestOptions,
} from "./ChannelNetwork";
import {
	createSuccessResponseMessage,
	validateMessage,
	isRequestMessage,
	createErrorResponseMessage,
} from "./message";
import { NotReadyError } from "./errors";
import {
	SuccessResponseMessage,
	UnknownRequestMessage,
	UnknownResponseMessage,
	UnknownTransaction,
	TransactionsHandlers,
	InternalReceiverRequestType,
	ExtractSuccessResponseMessage,
	RequestMessage,
	ResponseMessage,
	InternalEmitterRequestType,
} from "./types";

export type ChannelReceiverOptions = {
	readyTimeout: number;
};

export const channelReceiverDefaultOptions: ChannelReceiverOptions &
	Partial<ChannelNetworkOptions> = {
	readyTimeout: 20000,
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
		options?: Partial<AllChannelReceiverOptions>,
	) {
		super(requestHandlers, { ...channelReceiverDefaultOptions, ...options });

		window.addEventListener("message", this._onPublicMessage.bind(this));
	}

	/**
	 * Tells the emitter that receiver is ready
	 */
	public async ready(): Promise<SuccessResponseMessage> {
		if (window.parent === window) {
			throw new Error("Receiver is currently not embedded as an iframe");
		}

		this._ready = false;

		const request = this.createRequestMessage(
			InternalReceiverRequestType.Ready,
			undefined,
		);

		const response = await this.postRequest<
			RequestMessage<InternalReceiverRequestType.Ready>,
			ResponseMessage
		>(
			request,
			(request) => {
				window.parent.postMessage(request, "*");
			},
			{
				timeout: this.options.readyTimeout,
			},
		);

		this._ready = true;

		return response;
	}

	/**
	 * Handles public messages
	 */
	private _onPublicMessage(event: MessageEvent<unknown>): void {
		try {
			const message = validateMessage(event.data);

			if (isRequestMessage(message)) {
				if (this.options.debug) {
					// eslint-disable-next-line no-console
					console.debug(event.data);
				}

				switch (message.type) {
					case InternalEmitterRequestType.Connect:
						this.port = event.ports[0];

						const response = createSuccessResponseMessage(
							message.requestID,
							undefined,
						);

						this.postResponse(response);
						break;

					default:
						this.postResponse(
							createErrorResponseMessage(message.requestID, undefined),
							(response) => {
								(event.source as WindowProxy).postMessage(
									response,
									event.origin,
								);
							},
						);
						break;
				}
			} else {
				// Forward response messages to default message handler if necessary
				if (!this._ready) {
					this.onMessage(event);
				}
			}
		} catch (error) {
			if (error instanceof TypeError) {
				// Ignore unknown messages
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
