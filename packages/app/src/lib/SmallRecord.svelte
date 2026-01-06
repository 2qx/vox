<script lang="ts">
	import TokenIcon from './TokenIcon.svelte';
	import { disassembleBytecodeBch, hexToBin } from '@bitauth/libauth';

	let { tx_pos, tx_hash, height, value, token_data, now = $bindable() } = $props();
</script>

<div class="container">
	<div class="post">
		<div class="balance">
			<div>
				{#if token_data}
					<div>
						<TokenIcon size={24} category={token_data.category}></TokenIcon>
					</div>
				{/if}
			</div>
			<div class="fill">
				{#if token_data.nft.commitment}
					<pre> {disassembleBytecodeBch(hexToBin(token_data.nft.commitment))}</pre>
				{:else}
					<pre> undefined</pre>
				{/if}
			</div>
			<div>
				{#if height > 0}
					{height + value - now}
				{:else}
					{height}
				{/if}
			</div>
		</div>
		<div class="header">
			<div class="fill"></div>
			<div class="timestamp">{Number(value).toLocaleString(undefined, {})}</div>
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
		padding: 2px;
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
	pre {
		margin: 2px;
	}
	.hash {
		font-size: xx-small;
		font-weight: 200;
		align-content: flex-start;
		color: #857070;
		max-width: 70%;
		word-break: break-all;
	}
	.fill {
		flex: 1;
		word-break: break-all;
		display: flex;
		flex-direction: column;
	}
	.fill pre {
		white-space: pre-line;
	}
	.fill div {
		padding: 5px;
	}
	.fill div p {
		text-align: right;
	}
	.timestamp {
		font-size: xx-small;
		font-weight: 200;
		color: #777;
		word-break: break-all;
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
