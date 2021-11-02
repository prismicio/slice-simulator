<template>
	<div class="slice-iframe">
		<h3 class="heading-h2">{{ names.slice }}</h3>
		<figure class="mt-2 text-black-300 rounded border border-gray min-h-[calc(100vh-120px)] flex flex-col">
			<figcaption class="h-12 flex items-center px-4 border-b border-gray">
				<h4 class="font-medium text-sm">{{ names.variation }}</h4>
			</figcaption>
			<iframe ref="iframe" :src="src" frameborder="0" class="w-full flex-1"></iframe>
		</figure>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, toRaw, watch, watchEffect } from "vue";

import { RendererClient } from "@prismicio/slice-canvas-com";

import { state as rendererState, setLibraries, setCurrent } from "~/store/renderer";

interface Props {
	src: string;
};
const props = defineProps<Props>();

const iframe = ref<HTMLIFrameElement | null>(null);

let client: RendererClient | null = null;

const updateClient = async (reconnect = false) => {
	await client!.connect(reconnect);
	await client!.ping();

	const { data: libraries } = await client!.getLibraries();
	setLibraries(libraries);
	setCurrent(libraries[0].slices[0], libraries[0].slices[0].variations[0]);
}

onMounted(async () => {
	if (iframe.value) {
		client = new RendererClient(iframe.value, { debug: process.env.NODE_ENV === "development" });

		watch(() => props.src, () => updateClient(true));
		await updateClient();

		watchEffect(() => {
			client!.setSliceZoneFromSliceIDs([{
				sliceID: rendererState.value.current.slice.id,
				variationID: rendererState.value.current.variation.id,
			}]);
		});
	} else {
		throw new Error("iframe not found")
	}

});

const names = computed(() => {
	if (!rendererState.value.current) {
		return {
			slice: "Loading...",
			variation: "Loading..."
		}
	} else {
		return {
			slice: rendererState.value.current.slice.name,
			variation: rendererState.value.current.variation.name
		}
	}
})

defineExpose({ iframe, names });
</script>
