export const disableEventHandler = (event: Event): void => {
	event.preventDefault();
	event.stopPropagation();
};

export const onClickHandler = (
	event: MouseEvent & { path?: HTMLElement[] },
): void => {
	if (
		event.path &&
		event.path.slice(0, 5).some((el) => el instanceof HTMLAnchorElement)
	) {
		event.preventDefault();
		event.stopPropagation();
	}
};
