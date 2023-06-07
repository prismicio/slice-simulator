<script setup lang="ts">
import { SliceZone } from "@prismicio/client";

import { SimulatorClient } from "../../src";

const sliceZoneRaw = ref(
	JSON.stringify(
		[
			{
				slice_type: "contact_form",
				variation: "default",
				primary: {},
				items: [],
			},
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
		],
		null,
		2,
	),
);
const sliceZone = ref<SliceZone>([]);
const sliceZoneRawValid = ref(true);

watch(
	sliceZoneRaw,
	() => {
		try {
			sliceZone.value = JSON.parse(sliceZoneRaw.value);
			sliceZoneRawValid.value = true;
		} catch (error) {
			sliceZoneRawValid.value = false;
		}
	},
	{ immediate: true },
);

const iframe = ref<HTMLIFrameElement | null>(null);
const iframeSRC = ref("");
let client: SimulatorClient | null = null;

onMounted(async () => {
	if (iframe.value) {
		iframeSRC.value = "/slice-simulator";

		client = new SimulatorClient(
			iframe.value,
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

		await client.connect({ activeSliceAPI: false, sliceZoneSizeAPI: true });
		await client.ping();
		await client.setSliceZone(toRaw(sliceZone.value));
	} else {
		throw new Error("iframe not found");
	}
});

watch(sliceZone, async () => {
	if (client?.connected) {
		await client.setSliceZone(toRaw(sliceZone.value));
	}
});
</script>

<template>
	<main class="w-screen h-screen flex items-stretch font-mono bg-gray-50">
		<form class="w-[600px] p-4 flex flex-col gap-4 border-r border-gray-200">
			<h1 class="font-bold text-4xl">SliceZone</h1>
			<textarea
				v-model="sliceZoneRaw"
				class="resize-none flex-1 bg-gray-900 text-white px-2 py-1"
			/>
			<figure
				class="marquee text-red-400"
				data-text="Invalid JSON!"
				:class="{ 'opacity-0': sliceZoneRawValid }"
			>
				<span class="sr-only">Invalid JSON!</span>
			</figure>
		</form>
		<figure class="flex-1">
			<iframe
				ref="iframe"
				:src="iframeSRC"
				frameborder="0"
				class="w-full h-full"
			/>
		</figure>
	</main>
</template>
