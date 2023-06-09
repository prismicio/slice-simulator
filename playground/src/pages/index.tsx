import { SliceZone } from "@prismicio/client";
import clsx from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";

import { SimulatorClient } from "@/../../src";

export default function Index(): JSX.Element {
	const [sliceZoneRaw, setSliceZoneRaw] = useState(
		JSON.stringify(
			[
				{
					slice_type: "quote",
					variation: "default",
					primary: {
						quote: [
							{
								type: "heading2",
								text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Earum laboriosam numquam suscipit debitis velit perferendis reprehenderit enim, vero delectus iusto. Enim architecto quo beatae perferendis voluptatibus veritatis a accusamus placeat.",
							},
						],
						source: "John Doe",
					},
					items: [],
				},
				{
					slice_type: "contact_form",
					variation: "default",
					primary: {},
					items: [],
				},
			],
			null,
			2,
		),
	);
	const [sliceZoneRawValid, setSliceZoneRawValid] = useState(true);
	const [sliceZone, setSliceZone] = useState<SliceZone>([]);

	const updateSliceZone = () => {
		try {
			setSliceZone(JSON.parse(sliceZoneRaw));
			setSliceZoneRawValid(true);
		} catch (error) {
			setSliceZoneRawValid(false);
		}
	};
	useEffect(updateSliceZone, [sliceZoneRaw]);

	const [iframeSRC, setIframeSRC] = useState("");
	const client = useRef<SimulatorClient | null>(null);

	const iframe = useCallback((iframe: HTMLIFrameElement | null) => {
		if (iframe) {
			(async () => {
				if (iframe) {
					setIframeSRC("/slice-simulator");

					client.current = new SimulatorClient(
						iframe,
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

					await client.current.connect({
						activeSliceAPI: false,
						sliceZoneSizeAPI: true,
					});
					await client.current.ping();
					updateSliceZone();
				} else {
					throw new Error("iframe not found");
				}
			})();
		}
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
					value={sliceZoneRaw}
					onChange={(e) => setSliceZoneRaw(e.target.value)}
					className="resize-none flex-1 bg-gray-900 text-white px-2 py-1"
				/>
				<figure
					data-text="Invalid JSON!"
					className={clsx("marquee text-red-400", {
						"opacity-0": sliceZoneRawValid,
					})}
				>
					<span className="sr-only">Invalid JSON!</span>
				</figure>
			</form>
			<figure className="flex-1">
				<iframe
					ref={iframe}
					src={iframeSRC}
					frameBorder="0"
					className="w-full h-full"
				/>
			</figure>
		</main>
	);
}
