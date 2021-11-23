<template>
	<div class="slice-iframe">
		<h3 class="heading-h2">{{ names.slice }}</h3>
		<figure class="mt-2 text-black-300 rounded border border-gray h-[calc(100vh-120px)] flex flex-col">
			<figcaption class="h-12 flex items-center px-4 border-b border-gray">
				<h4 class="font-medium text-sm">{{ names.variation }}</h4>
			</figcaption>
			<div ref="container" class="w-full flex-1 relative overflow-auto" @mousemove="handleMouseMove">
				<div v-if="activeSlice" class="absolute border-2 border-[#ff0000] text-[#ff0000]" :style="{
					top: `${activeSlice.rect.top}px`,
					left: `${activeSlice.rect.left}px`,
					width: `${activeSlice.rect.width}px`,
					height: `${activeSlice.rect.height}px`,
				}">
					{{ activeSlice.sliceID }} - {{ activeSlice.variationID }} - {{ activeSlice.index }} - {{ activeSlice.rect }}
				</div>
				<iframe ref="iframe" :src="src" frameborder="0" class="w-full pointer-events-none" :style="{ height: '1284px' }"></iframe>
			</div>
		</figure>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";

import { RendererClient } from "@prismicio/slice-canvas-com";

import { state as rendererState, setLibraries, setCurrent } from "~/store/renderer";
import { ActiveSlice } from "@prismicio/slice-canvas-renderer";
import { throttle } from "../../../../../renderer/src/lib/throttle";

interface Props {
	src: string;
};
const props = defineProps<Props>();

const iframe = ref<HTMLIFrameElement | null>(null);
const container = ref<HTMLDivElement | null>(null);

let client: RendererClient | null = null;

const updateClient = async (newOrigin = false) => {
	await client!.connect(newOrigin);
	await client!.ping();

	const { data: libraries } = await client!.getLibraries();
	setLibraries(libraries);
	setCurrent(libraries[0].slices[0], libraries[0].slices[0].variations[0]);
}

onMounted(async () => {
	if (iframe.value) {
		client = new RendererClient(iframe.value, { debug: true });

		watch(() => props.src, () => updateClient(true));
		await updateClient();
	} else {
		throw new Error("iframe not found");
	}
});

watch(rendererState, async () => {
	if (client) {
		await client.setSliceZoneFromSliceIDs(
			rendererState.value.history.map(({ slice, variation }) => {
				return {
					sliceID: slice.id,
					variationID: variation.id,
				};
			})
		);
	}
}, { deep: true });

const activeSlice = ref<ActiveSlice | null>(null);

let maybePromise: ReturnType<RendererClient["getActiveSlice"]> | null = null;
const _handleMouseMove = async (event: MouseEvent) => {
	if (container.value && client && client.connected && !maybePromise) {
		maybePromise = client.getActiveSlice({ x: event.clientX - 305, y: event.clientY - 119 + container.value.scrollTop });
		activeSlice.value = (await maybePromise).data;
		maybePromise = null;
	}
};

const handleMouseMove = throttle(_handleMouseMove, 100);

const names = computed(() => {
	if (!rendererState.value.current) {
		return {
			slice: "Loading...",
			variation: "Loading...",
		};
	} else {
		return {
			slice: rendererState.value.current.slice.name,
			variation: rendererState.value.current.variation.name,
		};
	}
});
</script>
