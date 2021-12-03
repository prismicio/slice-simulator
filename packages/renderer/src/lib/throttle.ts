// eslint-disable-next-line @typescript-eslint/ban-types
export const throttle = (fn: Function, delay = 16) => {
	let waiting = false;

	return function (this: unknown, ...args: unknown[]) {
		if (!waiting) {
			fn.apply(this, args);
			waiting = true;
			setTimeout(() => {
				waiting = false;
			}, delay);
		}
	};
};
