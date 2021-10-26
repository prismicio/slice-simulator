export type Listener<T> = (event: T) => void;

export type EventMap = {
	[K in string]: unknown;
};

export abstract class EventEmitter<TEventMap = EventMap> {
	private listeners: { [K in keyof TEventMap]?: Listener<TEventMap[K]>[] } = {};

	on(
		event: keyof TEventMap,
		listener: Listener<TEventMap[typeof event]>,
	): void {
		this.listeners[event] = [...(this.listeners[event] ?? []), listener];
	}

	off(
		event: keyof TEventMap,
		listener: Listener<TEventMap[typeof event]>,
	): void {
		this.listeners[event] = (this.listeners[event] ?? []).filter(
			(l) => l !== listener,
		);
	}

	emit(event: keyof TEventMap, payload: TEventMap[typeof event]): void {
		(this.listeners[event] ?? []).forEach((listener) => listener(payload));
	}
}
