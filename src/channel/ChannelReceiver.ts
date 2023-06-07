import {
	ExtractSuccessResponseMessage,
	InternalEmitterRequestType,
	InternalEmitterTransactions,
	InternalReceiverRequestType,
	RequestMessage,
	ResponseMessage,
	SuccessResponseMessage,
	TransactionsHandlers,
	UnknownRequestMessage,
	UnknownResponseMessage,
	UnknownTransaction,
} from "./types";

import { NotReadyError } from "./errors";

import {
	ChannelNetwork,
	ChannelNetworkOptions,
	PostRequestOptions,
} from "./ChannelNetwork";
import {
	createErrorResponseMessage,
	createSuccessResponseMessage,
	isRequestMessage,
	validateMessage,
} from "./messages";

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
	TOptions extends Record<string, unknown> = Record<string, unknown>,
> extends ChannelNetwork<
	TEmitterTransactions,
	ChannelReceiverOptions & TOptions
> {
	private _ready = false;

	constructor(
		requestHandlers: TransactionsHandlers<TEmitterTransactions>,
		options: Partial<AllChannelReceiverOptions> & TOptions,
	) {
		super(requestHandlers, { ...channelReceiverDefaultOptions, ...options });

		window.addEventListener("message", (event) => {
			this._onPublicMessage(event);
		});
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
						// Set port
						this.port = event.ports[0];

						// Update options
						const { data } =
							message as InternalEmitterTransactions["connect"]["request"];
						this.options = {
							...this.options,
							...data,
							// Ensure core options remain the same
							debug: this.options.debug,
							requestIDPrefix: this.options.requestIDPrefix,
							readyTimeout: this.options.readyTimeout,
						};

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
				// Should not be possible, but who knows :shrug:
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
