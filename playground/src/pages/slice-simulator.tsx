import { SliceZone } from "@prismicio/react";

import { SliceSimulator } from "@/components/SliceSimulator";

import { components } from "@/slices";

/**
 * You can probably ignore this page. It renders the Slice simulator that appear
 * in Slice Machine.
 */
export default function SliceSimulatorPage(): JSX.Element {
	return (
		<SliceSimulator
			// The "sliceZone" prop should be a function receiving Slices and
			// rendering them using your "SliceZone" component.
			sliceZone={(props) => <SliceZone {...props} components={components} />}
		/>
	);
}
