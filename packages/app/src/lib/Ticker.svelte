<script lang="ts">
	import { CATEGORY_MAP, CATEGORY_MAP_CHIPNET } from '@fbch/lib';

	let { category, isMainnet } = $props();

	let FIRST_CLASS = new Map([
		['242f6ecedb404c743477e35b09733a56cacae34f3109d5cee1cbc1d5630affd7', 'BADGER'],
		['7003b9e854d2abc855b2c20c9734c3dfe4ec3a4de573f7ebb9ce1be527a5bb36', 'tBADGER'],
		['7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c', 'BPTS'],
		['8214f234225e5f555663290e0fb7b7b607bf0778221e6da97248bf020306831b', 'tBPTS'],
		['29972959d6f0dc766cdcb81bfaf8171c5605a64dd0a81fa46080f84ac87c9bef', 'PHOTON'],
		['8bc4c5974bb98a01d08ef9ba1b7208212b66678732519c4881d2fa924c2a159f', 'tPHOTON'],
		['bb61cd7a6c8a3a3742d965dc7ac73c1117382a5c8930b68338deb881f75c0214', 'tWBCH'],
		['ff4d6e4b90aa8158d39c5dc874fd9411af1ac3b5ed6f354755e8362a0d02c6b3', 'WBCH']
	]);

	let FUTURE_MAP = isMainnet ? CATEGORY_MAP : CATEGORY_MAP_CHIPNET;
	let baseFutureTicker = isMainnet ? 'FBCH' : 'tFBCH';
</script>

{#if FUTURE_MAP.has(category)}
	{baseFutureTicker}-{String(FUTURE_MAP.get(category)).padStart(7, '0')}
{:else if FIRST_CLASS.has(category)}
	{FIRST_CLASS.get(category)}
{:else}
	{category.substring(0, 8) + '...' + category.substring(category.length - 8, category.length)}
{/if}
