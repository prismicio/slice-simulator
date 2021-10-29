// Messages
export type MessageBase = {
	requestID: string;
};

export type RequestMessage<TType extends string = string, TData = void> = {
	type: TType;
	data: TData;
} & MessageBase;

export type ResponseMessageBase = {
	status: number;
	msg: string;
} & MessageBase;

export type SuccessResponseMessage<TData = void> = {
	data: TData;
	error?: never;
} & ResponseMessageBase;

export type ErrorResponseMessage<TError = unknown> = {
	data?: never;
	error: TError;
} & ResponseMessageBase;

export type ResponseMessage<TData = void, TError = unknown> =
	| SuccessResponseMessage<TData>
	| ErrorResponseMessage<TError>;

export type ExtractSuccessResponseMessage<
	TResponse extends UnknownResponseMessage,
> = Extract<TResponse, { error?: never }>;

export type ExtractErrorResponseMessage<
	TResponse extends UnknownResponseMessage,
> = Extract<TResponse, { data?: never }>;

// Unknown messages
export type UnknownRequestMessage = RequestMessage<string, unknown>;

export type UnknownSuccessResponseMessage = SuccessResponseMessage<unknown>;

export type UnknownErrorResponseMessage = ErrorResponseMessage<unknown>;

export type UnknownResponseMessage =
	| UnknownSuccessResponseMessage
	| UnknownErrorResponseMessage;

export type UnknownMessage = UnknownRequestMessage | UnknownResponseMessage;

// Transactions
export type Transaction<
	TRequest extends UnknownRequestMessage,
	TResponse extends UnknownResponseMessage = ResponseMessage<void>,
> = {
	request: TRequest;
	response: TResponse;
};

export type TransactionMethod<
	TTransaction extends Transaction<
		UnknownRequestMessage,
		UnknownResponseMessage
	>,
> = (
	data: TTransaction["request"]["data"],
) => Promise<ExtractSuccessResponseMessage<TTransaction["response"]>>;

export type TransactionHandler<
	TTransaction extends Transaction<
		UnknownRequestMessage,
		UnknownResponseMessage
	>,
> = (
	request: TTransaction["request"],
) =>
	| Promise<ExtractSuccessResponseMessage<TTransaction["response"]>>
	| ExtractSuccessResponseMessage<TTransaction["response"]>;

export type TransactionsMethods<
	TTransactions extends Record<string, UnknownTransaction>,
> = {
	[Key in keyof TTransactions]: TransactionMethod<TTransactions[Key]>;
};

export type TransactionsHandlers<
	TTransactions extends Record<string, UnknownTransaction>,
> = {
	[Key in keyof TTransactions]: TransactionHandler<TTransactions[Key]>;
};

// Unknown transactions
export type UnknownTransaction = Transaction<
	UnknownRequestMessage,
	UnknownResponseMessage
>;

export type UnknownTransactionMethod = TransactionMethod<UnknownTransaction>;

export type UnknownTransactionHandler = TransactionHandler<UnknownTransaction>;

// Emitter
export enum EmitterRequestType {
	Connect = "connect",
}

export type EmitterTransactions = {
	[EmitterRequestType.Connect]: Transaction<
		RequestMessage<EmitterRequestType.Connect>
	>;
};

// Receiver
export enum ReceiverRequestType {
	Ready = "ready",
}

export type ReceiverTransactions = {
	[ReceiverRequestType.Ready]: Transaction<
		RequestMessage<ReceiverRequestType.Ready>
	>;
};
