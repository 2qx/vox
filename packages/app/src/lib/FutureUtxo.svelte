<script lang="ts">
	import BCH from '$lib/images/BCH.svg';
	import tBCH from '$lib/images/tBCH.svg';

	import TokenNftData from './TokenNftData.svelte';
	import TokenAmount from './TokenAmount.svelte';
	import TokenIcon from './TokenIcon.svelte';

	let { tx_pos, tx_hash, height, value, token_data, isMainnet, redeemFutures, locktime, now } =
		$props();

	let bchIcon = isMainnet ? BCH : tBCH;
</script>

<div class="container">
	<div class="post">
		<div class="balance">
			<div>
				{#if token_data}
					<TokenIcon category={token_data.category} size={16} {isMainnet}></TokenIcon>
				{/if}
			</div>
			<div class="fill">
				{#if token_data}
					<div>
						<TokenAmount amount={token_data.amount} category={token_data.category} {isMainnet} />
					</div>
					<div>
						{#if token_data.nft}
							<TokenNftData {...token_data.nft} />
						{/if}
					</div>
				{/if}
			</div>
			<div>
				{#if value > 1000n}
					<img width="16px" src={bchIcon} /> <b>BCH</b>
					{Number(value / 100_000_000).toLocaleString(undefined, {})}
				{/if}
				{#if now >= locktime}
					<button
						class="action"
						onclick={() => {
							redeemFutures(tx_hash, tx_pos, locktime, token_data.amount);
						}}>redeem</button
					>
				{/if}
			</div>
		</div>
		<div class="header">
			<div class="timestamp">{tx_hash} : {tx_pos}</div>
			<div class="fill"></div>
			<div class="timestamp">{height}</div>
		</div>
	</div>
</div>

<style>
	.container {
		display: flex;
		padding: 2px;
	}
	.post {
		border-radius: 10px;
		padding: 5px 5px 5px 15px;
		background-color: #eeeeee;
		margin: auto;
		width: 100%;
		border: #bbb solid;
		border-width: 1px;
	}

	.header {
		display: flex;
	}
	.balance {
		display: flex;
	}
	
	.fill {
		flex: 1;
		word-break: break-all;
		display: flex;
		flex-direction: column;
	}
	
	.timestamp {
		font-size: xx-small;
		font-weight: 200;
		color: #777;
		word-break: break-all;
	}
	

	.post :global {
		p {
			font-weight: 400;
			line-height: 1;
		}
	}

	button {
		background-color: #a45eb6; /* Green */
		border: none;
		color: white;
		padding: 10px;
		border-radius: 20px;
		text-align: center;
		text-decoration: none;
		display: inline-block;
		font-size: 16px;
	}

	button:disabled {
		background-color: #777;
	}
	
</style>
