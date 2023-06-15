export {
	SimulatorClient,
	simulatorClientDefaultOptions,
} from "./SimulatorClient";

export { SimulatorAPI, simulatorAPIDefaultOptions } from "./SimulatorAPI";
export type { SimulatorAPIOptions } from "./SimulatorAPI";

export {
	// Validators
	validateMessage,
	isRequestMessage,
	isResponseMessage,
	isSuccessResponseMessage,
	isErrorResponseMessage,
	// Error classes
	ResponseError,
	ConnectionTimeoutError,
	TooManyConcurrentRequestsError,
	RequestTimeoutError,
	NotReadyError,
	PortNotSetError,
	ChannelNotSetError,
} from "./channel";
export type {
	RequestMessage,
	ResponseMessage,
	ErrorResponseMessage,
	SuccessResponseMessage,
	AllChannelEmitterOptions,
	AllChannelReceiverOptions,
} from "./channel";

export { APIRequestType, ClientRequestType } from "./types";
export type {
	ActiveSlice,
	SliceZoneSize,
	APITransactions,
	ClientTransactions,
} from "./types";

export * from "./globalExtensions";
