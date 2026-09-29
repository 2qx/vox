<script lang="ts">
	import Ticker from './Ticker.svelte';
	import { CATEGORY_MAP , CATEGORY_MAP_CHIPNET } from '@fbch/lib';

	let { amount, category, size, isMainnet } = $props();

	let FIRST_CLASS = new Map([
		['242f6ecedb404c743477e35b09733a56cacae34f3109d5cee1cbc1d5630affd7', 0],
		['7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c', 8], //SEQUIN
		['8214f234225e5f555663290e0fb7b7b607bf0778221e6da97248bf020306831b', 0],
		['c7ea26912c147b521ad956cf64461d844c3239d382ac6f7072dc43725247dc76', 0], // BPTS
		['10608586e070bbea7142435775f79161751972f180f64752bae974dbe023ebc3', 0], // tBPTS
		['bb61cd7a6c8a3a3742d965dc7ac73c1117382a5c8930b68338deb881f75c0214', 8],
		['29972959d6f0dc766cdcb81bfaf8171c5605a64dd0a81fa46080f84ac87c9bef', 8], //PHOTON
		['6f93bcf4b569c36560ad6d0f9f89cab812967be8f17922833172cb715a501e76', 8], //tPHOTON
		['ff4d6e4b90aa8158d39c5dc874fd9411af1ac3b5ed6f354755e8362a0d02c6b3', 8]
	]);
	
	const FUTURE_MAP = isMainnet ? CATEGORY_MAP : CATEGORY_MAP_CHIPNET;

</script>
<b> &nbsp;<Ticker {category} {isMainnet} /></b>
{#if Number(amount) > 0}
	{#if FUTURE_MAP.has(category)}
		{Number(amount / Math.pow(10, 8)).toLocaleString(undefined, {})}
	{:else if FIRST_CLASS.has(category)}
		{Number(amount / Math.pow(10, FIRST_CLASS.get(category)!)).toLocaleString(undefined, {})}
	{:else}
		{Number(amount).toLocaleString(undefined, {})}
	{/if}
{/if}

