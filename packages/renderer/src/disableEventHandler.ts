export const disableEventHandler = (event: Event): void => {
	event.preventDefault();
	event.stopPropagation();
};
