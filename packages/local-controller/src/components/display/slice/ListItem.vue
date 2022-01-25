<template>
	<article class="slice-list-item text-sm">
		<button class="font-medium leading-6 w-[calc(100%+1rem)] flex justify-between items-center px-2 -mx-2" @click.prevent="toggleActive">
			{{ slice.name }}
			<svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" :class="{
				'transform rotate-180': isActive
			}">
				<path d="M0 5.5L5 0.5L10 5.5H0Z" fill="#4E4E55"/>
			</svg>
		</button>
		<transition
			enter-from-class="transform -translate-x-4 opacity-0"
			enter-active-class="transition duration-300 ease"
			enter-to-class="transform translate-x-0 opacity-100"
		>
			<ul class="space-y-1 py-2" v-if="isActive">
				<li v-for="variation in slice.variations" :key="variation.id">
					<button
						class="text-gray-600 hover:bg-gray font-medium px-2 py-1 rounded-sm w-full text-left"
						:class="{ 'bg-gray': isActiveSimulator && currentVariationID === variation.id }"
						@click="setCurrent(slice, variation)"
					>
						{{ variation.name }}
					</button>
				</li>
			</ul>
		</transition>
	</article>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

import { SliceSummary } from "@prismicio/slice-simulator-com";

import { state as simulatorState, setCurrent } from "~/store/simulator";

interface Props {
	slice: SliceSummary
};
const props = defineProps<Props>();

const active = ref(false);

const toggleActive = (): void => {
	active.value = !active.value;
};

const isActiveSimulator = computed(() => {
	return simulatorState.value.current && simulatorState.value.current.slice.id === props.slice.id;
});
const isActive = computed(() => {
	return active.value || isActiveSimulator.value;
});
const currentVariationID = computed(() => {
	return simulatorState.value.current && simulatorState.value.current.variation.id;
});

defineExpose({ isActiveSimulator, isActive, toggleActive, currentVariationID, setCurrent });
</script>
