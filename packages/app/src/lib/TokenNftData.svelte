<script lang="ts">
	import { binToHex } from '@bitauth/libauth';
	import { parseUsername } from '@fbch/lib';
	import Trust from '@unspent/trust';
	let { commitment, capability } = $props();
</script>

<div class="capability">
	{#if capability}
		{capability} <img alt={`${capability}`} height="16px" src={`./${capability}.svg`} />
	{:else}
		immutable <img alt="immutable" height="16px" src={`./immutable.svg`} />
	{/if}
</div>

<div class="commitment">
	{#if commitment.startsWith('6a03553356')}
		Vox: <i>{parseUsername(commitment)}</i>
	{:else if commitment.startsWith('6a03553358')}
		CatDex: <i>{parseUsername(commitment)}</i>
	{:else if commitment.startsWith('03553350')}
		Trust: <i>{binToHex(Trust.parseCommitment(commitment).recipient)}</i>
	{:else}
		{commitment}
	{/if}
</div>

<style>
	.commitment {
		word-break: break-all;
	}

	.capability {
		display: flex;
		vertical-align: middle;
	}
</style>
