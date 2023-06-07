import { UnknownErrorResponseMessage } from ".";

import { UnknownRequestMessage } from "./types";

export class ResponseError<
	TErrorResponse extends UnknownErrorResponseMessage,
> extends Error {
	public response: TErrorResponse;

	constructor(errorResponse: TErrorResponse) {
		super(errorResponse.msg);

		this.response = errorResponse;
	}
}

export class ConnectionTimeoutError extends Error {
	constructor() {
		super("Connection timed out");
	}
}
export class TooManyConcurrentRequestsError extends Error {
	public request: UnknownRequestMessage;

	constructor(request: UnknownRequestMessage) {
		super(`Too many concurrent requests`);

		this.request = request;
	}
}
export class RequestTimeoutError<
	TRequest extends UnknownRequestMessage,
> extends Error {
	public request: UnknownRequestMessage;

	constructor(request: TRequest) {
		super(`Request \`${request.requestID}\` timed out`);

		this.request = request;
	}
}

export class NotReadyError extends Error {}
export class PortNotSetError extends Error {
	constructor() {
		super("Port is not set");
	}
}
export class ChannelNotSetError extends Error {
	constructor() {
		super("Channel is not set");
	}
}
