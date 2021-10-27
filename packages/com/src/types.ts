import {
	SliceSummary,
	VariationSummary,
} from "@prismicio/slice-canvas-renderer";

export enum MessageType {
	Ping = "ping",
	GetLibraries = "getLibraries",
	SetSlicesByID = "setSlicesByID",
}

export type Messages = {
	[MessageType.Ping]: Message<MessageType.Ping>;
	[MessageType.GetLibraries]: Message<MessageType.GetLibraries>;
	[MessageType.SetSlicesByID]: Message<
		MessageType.SetSlicesByID,
		{ slice: SliceSummary; variation: VariationSummary }[]
	>;
};

// Helpers

type Response = {
	messageID: number;
	status: number;
	msg?: string;
};

export type SuccessResponse<T = unknown> = {
	data: T;
} & Response;

export type ErrorResponse<T = unknown> = {
	error: T;
} & Response;

export type Message<
	TType extends string | number | symbol = string | number | symbol,
	TData = unknown,
> = {
	id: number;
	type: TType;
	data: TData;
};
