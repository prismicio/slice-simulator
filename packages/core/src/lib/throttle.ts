// eslint-disable-next-line @typescript-eslint/ban-types
export const throttle = (fn: Function, delay = 16) => {
	let lastExec = 0;
	let timer: NodeJS.Timeout | null = null;

	return function (this: unknown, ...args: unknown[]) {
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
