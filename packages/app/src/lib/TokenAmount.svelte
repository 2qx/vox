<script lang="ts">
	import Ticker from './Ticker.svelte';
	import { CATEGORY_MAP , CATEGORY_MAP_CHIPNET } from '@fbch/lib';

	let { amount, category, isMainnet } = $props();

	let FIRST_CLASS = new Map([
		['242f6ecedb404c743477e35b09733a56cacae34f3109d5cee1cbc1d5630affd7', 0],
		['7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c', 0],
		['ffc9d3b3488e890ef113b1c74f40e1f5eb1147a7d4191cecac89fd515721a271', 0],
		['bb61cd7a6c8a3a3742d965dc7ac73c1117382a5c8930b68338deb881f75c0214', 8],
		['ff4d6e4b90aa8158d39c5dc874fd9411af1ac3b5ed6f354755e8362a0d02c6b3', 8]
	]);
	
	let FUTURE_MAP = isMainnet ? CATEGORY_MAP : CATEGORY_MAP_CHIPNET;

</script>

{#if Number(amount) > 0}
	{#if FUTURE_MAP.has(category)}
		{Number(amount / Math.pow(10, 8)).toLocaleString(undefined, {})}
	{:else if FIRST_CLASS.has(category)}
		{Number(amount / Math.pow(10, FIRST_CLASS.get(category)!)).toLocaleString(undefined, {})}
	{:else}
		{Number(amount).toLocaleString(undefined, {})}
	{/if}
{/if}
<b> &nbsp;<Ticker {category} {isMainnet} /></b>
