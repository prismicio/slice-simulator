export type Listener<T> = (event: T) => void;

export type EventMap = {
	[K in string]: unknown;
};

export abstract class EventEmitter<TEventMap = EventMap> {
	private _listeners: {
		[K in keyof TEventMap]?: [Listener<TEventMap[K]>, string | null][];
	} = {};

	on<TEventType extends keyof TEventMap>(
		event: TEventType,
		listener: Listener<TEventMap[TEventType]>,
		key: string | null = null,
	): void {
		this._listeners[event] = [
			...(this._listeners[event] ?? []),
			[listener, key],
		];
	}

	off<TEventType extends keyof TEventMap>(
		event: TEventType,
		listenerOrKey: Listener<TEventMap[TEventType]> | string,
	): void {
		this._listeners[event] = (this._listeners[event] ?? []).filter(
			([listener, key]) =>
				typeof listenerOrKey === "function"
					? listener !== listenerOrKey
					: key !== listenerOrKey,
		);
	}

	emit<TEventType extends keyof TEventMap>(
		event: TEventType,
		payload: TEventMap[TEventType],
	): void {
		(this._listeners[event] ?? []).forEach((listener) => listener[0](payload));
	}
}
