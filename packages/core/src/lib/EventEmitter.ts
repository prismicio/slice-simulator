export type Listener<T> = (event: T) => void;

export type EventMap = {
	[K in string]: unknown;
};

export abstract class EventEmitter<TEventMap = EventMap> {
	private listeners: { [K in keyof TEventMap]?: Listener<TEventMap[K]>[] } = {};

	on<TEventType extends keyof TEventMap>(
		event: TEventType,
		listener: Listener<TEventMap[TEventType]>,
	): void {
		this.listeners[event] = [...(this.listeners[event] ?? []), listener];
	}

	off<TEventType extends keyof TEventMap>(
		event: TEventType,
		listener: Listener<TEventMap[TEventType]>,
	): void {
		this.listeners[event] = (this.listeners[event] ?? []).filter(
			(l) => l !== listener,
		);
	}

	emit<TEventType extends keyof TEventMap>(
		event: TEventType,
		payload: TEventMap[TEventType],
	): void {
		(this.listeners[event] ?? []).forEach((listener) => listener(payload));
	}
}
