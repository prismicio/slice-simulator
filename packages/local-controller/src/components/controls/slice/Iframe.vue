<template>
	<div class="slice-iframe">
		<h3 class="heading-h2">{{ names.slice }}</h3>
		<figure class="mt-2 text-black-300 rounded border border-gray min-h-[calc(100vh-120px)] flex flex-col">
			<figcaption class="h-12 flex items-center px-4 border-b border-gray">
				<h4 class="font-medium text-sm">{{ names.variation }}</h4>
			</figcaption>
			<div class="flex-1 relative flex overflow-hidden">
				<div v-if="activeSlice" class="absolute border-2 border-[#ff0000] pointer-events-none" :style="{
					top: `${activeSlice.rect.top}px`,
					left: `${activeSlice.rect.left}px`,
					width: `${activeSlice.rect.width}px`,
					height: `${activeSlice.rect.height}px`,
				}">
					<form action="#" method="GET" @submit.prevent class="pointer-events-auto absolute top-1 right-1 gap-1 flex">
						<button class="rounded bg-gray w-6 h-6" @click="action('up')">
							&#8593;
						</button>
						<button class="rounded bg-gray w-6 h-6" @click="action('down')">
							&#8595;
						</button>
						<button class="rounded bg-gray w-6 h-6" @click="action('focus')">&plus;</button>
						<button class="rounded bg-gray w-6 h-6" @click="action('delete')">&times;</button>
					</form>
					<small class="absolute bottom-1 left-1 text-xs text-[#ff0000]">
						{{ activeSlice.sliceID }} - {{ activeSlice.variationID }} - {{ activeSlice.index }}
					</small>
				</div>
				<iframe ref="iframe" :src="src" frameborder="0" class="w-full"></iframe>
			</div>
		</figure>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, toRaw, watch, watchEffect } from "vue";

import { ActiveSlice, SimulatorClient } from "@prismicio/slice-simulator-com";

import { state as simulatorState, setLibraries, setCurrent, setHistory } from "~/store/simulator";

interface Props {
	src: string;
};
const props = defineProps<Props>();

const iframe = ref<HTMLIFrameElement | null>(null);

const activeSlice = ref<ActiveSlice | null>(null);

let client: SimulatorClient | null = null;

const updateClient = async (newOrigin = false) => {
	await client!.connect(newOrigin);
	await client!.ping();

	const { data: libraries } = await client!.getLibraries();
	setLibraries(libraries);
	setCurrent(libraries[0].slices[0], libraries[0].slices[0].variations[0]);
}

onMounted(async () => {
	if (iframe.value) {
		client = new SimulatorClient(iframe.value, {
			setActiveSlice: (req, res) => {
				activeSlice.value = req.data;

				return res.success();
			}
		}, { debug: true });

		watch(() => props.src, () => updateClient(true));
		await updateClient();
	} else {
		throw new Error("iframe not found");
	}
});

watch(simulatorState, async () => {
	if (client) {
		await client.setSliceZoneFromSliceIDs(
			simulatorState.value.history.map(({ slice, variation }) => {
				return {
					sliceID: slice.id,
					variationID: variation.id,
				};
			})
		);
	}
}, { deep: true });

const names = computed(() => {
	if (!simulatorState.value.current) {
		return {
			slice: "Loading...",
			variation: "Loading...",
		};
	} else {
		return {
			slice: simulatorState.value.current.slice.name,
			variation: simulatorState.value.current.variation.name,
		};
	}
})

const action = (type: "up" | "down" | "delete" | "focus") => {
	if (!activeSlice.value) {
		return;
	}
	const activeSliceIndex = activeSlice.value.index;
	let newHistory = simulatorState.value.history.slice();

	switch (type) {
		case "up":
			[newHistory[Math.max(0, activeSliceIndex - 1)], newHistory[activeSliceIndex]] = [newHistory[activeSliceIndex], newHistory[Math.max(0, activeSliceIndex - 1)]];

			break;
		case "down":
			[newHistory[activeSliceIndex], newHistory[Math.min(activeSliceIndex + 1, newHistory.length - 1)]] = [newHistory[Math.min(activeSliceIndex + 1, newHistory.length - 1)], newHistory[activeSliceIndex]];

			break;

		case "focus":
			client && client.scrollToSlice({ sliceIndex: activeSliceIndex, behavior: "smooth", block: "center" });
			return;

		case "delete":
			newHistory = (newHistory as unknown[]).filter((_, index) => index !== activeSliceIndex);
			break;
	}

	setHistory(newHistory);
}

defineExpose({ iframe, names });
</script>
