<template>
	<div class="slice-iframe">
		<h3 class="heading-h2">{{ names.slice }}</h3>
		<figure class="mt-2 text-black-300 rounded border border-gray min-h-[calc(100vh-120px)] flex flex-col">
			<figcaption class="h-12 flex items-center px-4 border-b border-gray">
				<h4 class="font-medium text-sm">{{ names.variation }}</h4>
			</figcaption>
			<iframe ref="iframe" src="http://localhost:3000/slice-canvas" frameborder="0" class="w-full flex-1"></iframe>
		</figure>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, toRaw, unref, watchEffect } from "vue";

import { RendererClient } from "@prismicio/slice-canvas-com";

import { state as rendererState, setLibraries, setCurrent } from "~/store/renderer";

interface Props {
	slice: {
		name: string;
		id: string;
	};
	variation: {
		name: string;
		id: string;
	};
};
defineProps<Props>();

const iframe = ref<HTMLIFrameElement | null>(null);

onMounted(() => {
	if (iframe.value) {

		const client = new RendererClient(iframe.value, { debug: process.env.NODE_ENV === "development" });

		iframe.value.addEventListener("load", () => {
			// TODO: Remove timeout used as a hack to wait for the iframe JavaScript to be loaded
			setTimeout(async () => {
				await client.connect();
				await client.ping();

				const { data: libraries } = await client.getLibraries();

				setLibraries(libraries);
				setCurrent(libraries[0].slices[0], libraries[0].slices[0].variations[0]);

				watchEffect(() => {
					client.setSlicesByID([toRaw(rendererState.value.current)]);
				});
			}, 500);
		}, { once: true });


	} else {
		console.error("iframe not found");
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
