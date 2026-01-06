<script>
	let { address, isMainnet = true } = $props();
</script>

<div>
	{#if address}
		{#if isMainnet}
			<a target="_blank" href="https://explorer.salemkode.com/address/{address}">salemkode</a>
			<a target="_blank" href="https://explorer.bch.ninja/address/{address}">bch.ninja</a>
		{:else}
			<a target="_blank" href="https://chipnet.bch.ninja/address/{address}">bch.ninja</a>
			<a target="_blank" href="https://chipnet.chaingraph.cash/address/{address}">chaingraph.cash</a>
			<a target="_blank" href="https://chipnet.imaginary.cash/address/{address}">imaginary.cash</a>
		{/if}
	{/if}
</div>

<style>
	div {
		display: flex;
		flex-wrap: wrap;
	}
	div a {
		display: inline-block;
		border-radius: 5px;
		background-color: #52254873;
		color: #eee;
		margin: 2px;
		padding: 2px;
		font-weight: 400;
		font-size: small;
	}
</style>
