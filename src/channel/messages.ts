import type {
	ErrorResponseMessage,
	RequestMessage,
	SuccessResponseMessage,
	UnknownErrorResponseMessage,
	UnknownMessage,
	UnknownRequestMessage,
	UnknownResponseMessage,
	UnknownSuccessResponseMessage,
} from "./types"

// Adapted from https://github.com/jshttp/statuses/blob/770a97d931c1bb40ebbfefdbb77f0419601890b5/codes.json
const statuses = {
	200: "ok",
	201: "created",

	400: "bad request",
	500: "internal server error",
	501: "not implemented",
}

let requestID = 0

export const createRequestMessage = <
	TType extends string = string,
	TData = undefined,
>(
	type: TType,
	data: TData,
	prefix = "",
): RequestMessage<TType, TData> => {
	return {
		requestID: `${prefix}${requestID++}`,
		type,
		data,
	}
}

export const createSuccessResponseMessage = <TData = undefined>(
	requestID: string,
	data: TData,
	status: keyof typeof statuses = 200,
): SuccessResponseMessage<TData> => {
	if (status >= 400) {
		throw new TypeError(
			`Invalid success status code, expected status to be within \`[100;400[\`, got \`${status}\``,
		)
	}

	return {
		requestID,
		status,
		msg: statuses[status] ?? "",
		data,
	}
}

export const createErrorResponseMessage = <TError = undefined>(
	requestID: string,
	error: TError,
	status: keyof typeof statuses = 400,
): ErrorResponseMessage<TError> => {
	if (status < 400) {
		throw new TypeError(
			`Invalid error status code, expected status to be within \`[400;600[\`, got \`${status}\``,
		)
	}

	return {
		requestID,
		status,
		msg: statuses[status] ?? "",
		error,
	}
}

export const validateMessage = (message: unknown): UnknownMessage => {
	if (typeof message !== "object" || message === null) {
		throw new TypeError(
			`Invalid message received, expected message to be of type \`object\`, got \`${typeof message}\``,
		)
	} else if (
		!Object.keys(message).every((key) =>
			["requestID", "type", "data", "status", "msg", "error"].includes(key),
		)
	) {
		throw new TypeError(`Invalid message received: ${JSON.stringify(message)}`)
	} else if (
		typeof (message as Record<string, unknown>).requestID !== "string"
	) {
		throw new TypeError(
			`Invalid message received, expected \`message.requestID\` to be of type \`string\`, got \`${typeof (
				message as Record<string, unknown>
			).id}\``,
		)
	}

	return message as UnknownMessage
}

export const isRequestMessage = (
	message: UnknownMessage,
): message is UnknownRequestMessage => {
	return "type" in message
}

export const isResponseMessage = (
	message: UnknownMessage,
): message is UnknownResponseMessage => {
	return !("type" in message)
}

export const isSuccessResponseMessage = (
	message: UnknownMessage,
): message is UnknownSuccessResponseMessage => {
	return isResponseMessage(message) && !("error" in message)
}

export const isErrorResponseMessage = (
	message: UnknownMessage,
): message is UnknownErrorResponseMessage => {
	return isResponseMessage(message) && !("data" in message)
}
