<script lang="ts">
	
	import { CATEGORY_MAP , CATEGORY_MAP_CHIPNET } from '@fbch/lib';

	let { category, isMainnet } = $props();

	let FIRST_CLASS = new Map([
		['242f6ecedb404c743477e35b09733a56cacae34f3109d5cee1cbc1d5630affd7', 'BADGER'],
		['7003b9e854d2abc855b2c20c9734c3dfe4ec3a4de573f7ebb9ce1be527a5bb36', 'tBADGER'],
		['7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c', 'BPTS'],
		['ffc9d3b3488e890ef113b1c74f40e1f5eb1147a7d4191cecac89fd515721a271', 'tBPTS'],
		['bb61cd7a6c8a3a3742d965dc7ac73c1117382a5c8930b68338deb881f75c0214', 'tWBCH'],
		['ff4d6e4b90aa8158d39c5dc874fd9411af1ac3b5ed6f354755e8362a0d02c6b3', 'WBCH']
	]);

	let FUTURE_MAP = isMainnet ? CATEGORY_MAP : CATEGORY_MAP_CHIPNET;
	let baseFutureTicker = isMainnet ? "FBCH" : "tFBCH"

</script>

{#if FUTURE_MAP.has(category)}
	{baseFutureTicker}-{String(FUTURE_MAP.get(category)).padStart(7, '0')}
{:else if FIRST_CLASS.has(category)}
	{FIRST_CLASS.get(category)}
{:else}
	{category.substring(0, 6) + '...' + category.substring(category.length-6, category.length)}
{/if}
