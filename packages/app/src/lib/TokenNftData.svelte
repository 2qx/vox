<script lang="ts">
	import { parseUsername } from '@fbch/lib';
	let { commitment, capability } = $props();
</script>

<div class="capability">
	{#if capability}
		{capability} <img height=16px src={`./${capability}.svg`} /> 
	{:else}
		immutable <img  height=16px  src={`./immutable.svg`} /> 
	{/if}
</div>

<div class="commitment">
	{#if commitment.startsWith('6a03553356')}
		Vox: <i>{parseUsername(commitment)}</i>
	{:else if commitment.startsWith('6a03553358')}
		CatDex: <i>{parseUsername(commitment)}</i>
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
