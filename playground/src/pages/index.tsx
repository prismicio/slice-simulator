import { SliceZone } from "@prismicio/client";
import clsx from "clsx";
import { useEffect, useReducer, useRef, useState } from "react";

import { SimulatorClient } from "@/../../src";

const initialSliceZone: SliceZone = [
	{
		slice_type: "quote",
		slice_label: null,
		variation: "default",
		primary: {
			quote: [
				{
					type: "heading2",
					text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Earum laboriosam numquam suscipit debitis velit perferendis reprehenderit enim, vero delectus iusto. Enim architecto quo beatae perferendis voluptatibus veritatis a accusamus placeat.",
					spans: [],
				},
			],
			source: "John Doe",
		},
		items: [],
	},
	{
		slice_type: "contact_form",
		slice_label: null,
		variation: "default",
		primary: {},
		items: [],
	},
];

export default function Index(): JSX.Element {
	const [, rerender] = useReducer(() => ({}), {});
	const [isReady, setIsReady] = useState(false);
	const client = useRef<SimulatorClient | null>(null);
	const iframe = useRef<HTMLIFrameElement>(null);
	const [sliceZoneInput, setSliceZoneInput] = useState(
		JSON.stringify(initialSliceZone, null, 2),
	);

	let sliceZone = initialSliceZone;
	let sliceZoneIsValid = true;

	try {
		sliceZone = JSON.parse(sliceZoneInput);
	} catch {
		sliceZoneIsValid = false;
	}

	useEffect(() => {
		if (!iframe.current) {
			throw new Error("iframe not available");
		}

		setIsReady(true);

		client.current = new SimulatorClient(
			iframe.current,
			{
				setActiveSlice: (req, res) => {
					console.log(req.data);

					return res.success();
				},
				setSliceZoneSize: (req, res) => {
					console.log(req.data);

					return res.success();
				},
			},
			{ debug: true },
		);

		client.current
			.connect({
				activeSliceAPI: false,
				sliceZoneSizeAPI: true,
			})
			.then(() => client.current?.ping)
			.then(() => rerender());

		return () => {
			client.current?.disconnect();
		};
	}, []);

	useEffect(() => {
		if (client.current?.connected) {
			client.current.setSliceZone(sliceZone);
		}
	}, [sliceZone]);

	return (
		<main className="w-screen h-screen flex items-stretch font-mono bg-gray-50">
			<form className="w-[600px] p-4 flex flex-col gap-4 border-r border-gray-200">
				<h1 className="font-bold text-4xl">SliceZone</h1>
				<textarea
					value={sliceZoneInput}
					onChange={(e) => setSliceZoneInput(e.target.value)}
					className="resize-none flex-1 bg-gray-900 text-white px-2 py-1"
				/>
				<figure
					data-text="Invalid JSON!"
					className={clsx("marquee text-red-400", {
						"opacity-0": sliceZoneIsValid,
					})}
				>
					<span className="sr-only">Invalid JSON!</span>
				</figure>
			</form>
			<figure className="flex-1">
				<iframe
					ref={iframe}
					src={isReady ? "/slice-simulator" : undefined}
					frameBorder="0"
					className="w-full h-full"
				/>
			</figure>
		</main>
	);
}
