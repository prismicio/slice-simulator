import statuses from "statuses";
import { ErrorResponse, Message, SuccessResponse } from "../types";

export abstract class ChannelReceiver<
	TMessages extends Record<string | number | symbol, Message> = Record<
		string,
		never
	>,
> {
	public static validateMessage(message: Message): void {
		if (
			!Object.keys(message).every((key) => ["id", "type", "data"].includes(key))
		) {
			throw new Error(`Unknown message received: ${JSON.stringify(message)}`);
		}
	}

	private _port: MessagePort | null = null;
	private _messageHandlers: {
		[key in keyof TMessages]: (message: TMessages[key]) => void;
	};
	private options: { debug: boolean } = { debug: false };

	constructor(
		messageHandlers: {
			[key in keyof TMessages]: (message: TMessages[key]) => void;
		},
		options?: { debug?: boolean },
	) {
		this._messageHandlers = messageHandlers;
		this.options = { ...this.options, ...options };

		window.addEventListener("message", this._connect.bind(this));
	}

	private _connect(event: MessageEvent<Message>) {
		const message = event.data;

		if (this.options.debug) {
			// eslint-disable-next-line no-console
			console.debug(message);
		}

		try {
			ChannelReceiver.validateMessage(message);
		} catch (error) {
			return console.warn((error as Error).message);
		}

		// TODO: check origin?
		this._port = event.ports[0];
		this._port.onmessage = this.onMessage.bind(this);

		this.sendSuccess(message.id);
	}

	protected onMessage: (event: MessageEvent<Message>) => void = (event) => {
		const message = event.data;

		if (this.options.debug) {
			// eslint-disable-next-line no-console
			console.debug(message);
		}

		try {
			ChannelReceiver.validateMessage(message);
		} catch (error) {
			return console.warn((error as Error).message);
		}

		if (!this._messageHandlers[message.type]) {
			this.sendError(message.id, 400);
		} else {
			// TODO: Improve validation
			this._messageHandlers[message.type as keyof TMessages](
				message as TMessages[typeof message.type],
			);
		}
	};

	private _sendResponse(body: SuccessResponse | ErrorResponse) {
		if (this._port) {
			this._port.postMessage(body);
		} else {
			throw new Error("No port setup yet!");
		}
	}

	protected sendSuccess<T>(messageID: number, status = 200, data?: T) {
		if (status >= 400) {
			throw new Error(`Invalid success status code: ${status}`);
		}

		this._sendResponse({
			messageID,
			status,
			msg: statuses.message[status]?.replace(/\.$/, "").toLowerCase(),
			data,
		});
	}

	protected sendError<T>(messageID: number, status = 500, error?: T) {
		if (status < 400) {
			throw new Error(`Invalid error status code: ${status}`);
		}

		this._sendResponse({
			messageID,
			status,
			msg: statuses.message[status]?.replace(/\.$/, "").toLowerCase(),
			error,
		});
	}
}
