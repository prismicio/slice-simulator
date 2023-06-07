export const simulatorClass = "slice-simulator";
export const simulatorRootClass = "slice-simulator--root";

export const getSimulatorDOM = (): Element | null => {
	return document.querySelector(`.${simulatorClass}`);
};

export const getSimulatorRootDOM = (): Element | null => {
	return document.querySelector(`.${simulatorRootClass}`);
};

export const getSliceZoneDOM = (
	expectedNumberOfChildren: number,
): Element | null => {
	// If SliceZone has been tagged (#5)
	let node = document.querySelector(`.${simulatorClass} [data-slice-zone]`);
	if (node) {
		if (node.children.length !== expectedNumberOfChildren) {
			console.warn(
				`Flagged SliceZone has an unexpected number of children, found ${node.children.length} but expected ${expectedNumberOfChildren}. This might lead to unexpected behaviors. Are you sure you tagged the right element?`,
			);
		}

		return node;
	}

	// Start searching
	node = document.querySelector(`.${simulatorClass} .${simulatorRootClass}`);

	if (!node) {
		return null;
	}

	const searchDepth = 5;
	for (let i = 0; i < searchDepth; i++) {
		if (node.children.length === expectedNumberOfChildren) {
			// Return the first node that matches the expected number of children
			return node;
		} else if (node.children.length) {
			// Continue searching if current node has children
			node = node.children[0];
		} else {
			// Stop searching if current node has no children
			break;
		}
	}

	// Failed to find SliceZone
	return null;
};

export const getActiveSliceDOM = (
	$sliceZone: Element,
	mouse: { x: number; y: number },
): Element | null => {
	// Raycast cursor position on DOM
	const raycast = document.elementsFromPoint(mouse.x, mouse.y).reverse();

	// Find SliceZone in raycast
	const sliceZoneIndex = raycast.indexOf($sliceZone);

	// SliceZone is not part of raycast
	if (sliceZoneIndex === -1) {
		return null;
	}

	const $slice = raycast[sliceZoneIndex + 1];

	// Slice is not part of raycast
	if (!$slice) {
		return null;
	}

	return $slice;
};
