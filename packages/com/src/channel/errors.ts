import { UnknownRequestMessage } from "./types";

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
export class RequestTimeoutError extends Error {
	public request: UnknownRequestMessage;

	constructor(request: UnknownRequestMessage) {
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
