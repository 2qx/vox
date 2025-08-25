<script lang="ts">
	import { disassembleBytecodeBCH, hexToBin } from '@bitauth/libauth';
	import bch from '$lib/images/BCH.svg';

	import Ticker from './Ticker.svelte';
	import TokenIcon from './TokenIcon.svelte';

	let { tx_pos, tx_hash, height, value, token_data } = $props();
</script>

<div class="container">
	<div class="post">
		
		<div class="balance">
			<div class="fill">
				{#if token_data}
					<TokenIcon category={token_data.category}></TokenIcon>
					
					{#if Number(token_data.amount) > 0}
						{Number(token_data.amount).toLocaleString(undefined, {})}
					{/if}<b> &nbsp;<Ticker category={token_data.category}/></b><br>
					{#if token_data.nft }
						{disassembleBytecodeBCH(hexToBin(token_data.nft.commitment))}
					{/if}
				{/if}
			</div>
			<div>
				{Number(value).toLocaleString(undefined, {})} sats <img width="20px" src={bch} />
			</div>
		</div>
		<div class="header">
			<div class="timestamp">{tx_hash} : {tx_pos}</div>
			<div class="fill"></div>
			<div class="timestamp"> {height}</div>
		</div>
	</div>
</div>

<style>
	.container {
		display: flex;
		padding: 5px;
	}
	.post {
		border-radius: 10px;
		padding: 5px 5px 5px 15px;
		background-color: #eeeeee;
		margin: auto;
		width: 100%;
	}

	.header {
		display: flex;
	}
	.balance {
		display: flex;
	}
	.hash {
		font-size: xx-small;
		font-weight: 200;
		align-content: flex-start;
		color: #857070;
		max-width: 70%;
		word-wrap: anywhere;
	}
	.fill {
		flex: 1;
		word-wrap: anywhere;
	}
	.timestamp {
		font-size: xx-small;
		font-weight: 200;
		color: #777;
	}
	.auth {
		align-content: center;
		padding: 5px 5px 5px 5px;
	}
	.auth img {
		border-radius: 50%;
	}

	.post :global {
		p {
			font-weight: 400;
			line-height: 1;
		}
	}

	.post.op {
		background-color: #fff;
	}

	.error {
		color: brown;
	}
</style>
