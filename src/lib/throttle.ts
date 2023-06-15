// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const throttle = <TFn extends (...args: any[]) => any>(
	fn: TFn,
	delay = 16,
): ((...args: Parameters<TFn>) => void) => {
	let lastExec = 0;
	let timer: NodeJS.Timeout | null = null;

	return function (this: unknown, ...args: Parameters<TFn>) {
		const now = Date.now();
		const delta = now - lastExec;

		if (delta >= delay) {
			fn.apply(this, args);
			lastExec = now;
		} else {
			if (timer) {
				clearTimeout(timer);
			}
			timer = setTimeout(() => {
				fn.apply(this, args);
				lastExec = Date.now();
			}, delay - delta);
		}
	};
};
