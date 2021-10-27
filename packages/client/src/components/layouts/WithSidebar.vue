<template>
	<div class="__layout__with-sidebar flex h-screen">
		<aside class="w-[280px] px-5 py-8 bg-gray-200 overflow-scroll">
			<AppLogo class="mx-2 mb-8" />

			<slot name="sidebar" />
		</aside>
		<main class="px-6 py-8 flex-1 overflow-scroll">
			<slot />
		</main>
	</div>
</template>

<script setup lang="ts">
import AppLogo from "~/components/display/AppLogo.vue";
</script>
