<script lang="ts">
	import { blo } from 'blo';

	import { CATEGORY_MAP as FUTURE_MAP } from '@fbch/lib';
	import FbchIcon from './FbchIcon.svelte';

	let { category } = $props();

	let FIRST_CLASS = new Map([
		['242f6ecedb404c743477e35b09733a56cacae34f3109d5cee1cbc1d5630affd7', '/badger.svg'],
		['7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c', '/BPTS.svg'],
		['ffc9d3b3488e890ef113b1c74f40e1f5eb1147a7d4191cecac89fd515721a271', '/tBPTS.svg'],
		['bb61cd7a6c8a3a3742d965dc7ac73c1117382a5c8930b68338deb881f75c0214', '/tWBCH.svg'],
		['ff4d6e4b90aa8158d39c5dc874fd9411af1ac3b5ed6f354755e8362a0d02c6b3', '/WBCH.svg']
	]);
</script>

{#if FUTURE_MAP.has(category)}
	<FbchIcon time={FUTURE_MAP.get(category)} size={64} />
{:else if FIRST_CLASS.has(category)}
	<img height="64px" src={FIRST_CLASS.get(category)} alt={FIRST_CLASS.get(category)} />
{:else}
	<div class="fallback">
		<img height="64px" src={blo(category, 16)} alt={category} />
	</div>
{/if}

<style>
	.fallback img {
		border-radius: 20px;
	}
	img {
		filter: drop-shadow(5px 5px 5px #b1aeaead);
	}
</style>
