<script lang="ts">
	import bch from '$lib/images/BCH.svg';

	import { binToHex } from '@bitauth/libauth';
	import TokenNftData from './TokenNftData.svelte';
	import Ticker from './Ticker.svelte';
	import TokenIcon from './TokenIcon.svelte';
	let { authCategory, assetCategory, orderUtxo, assetUtxo, price, amount, quantity, value } =
		$props();
	let bid = $derived(false);
	bid = !(quantity<0)
</script>

<div class={["container",{bid}]}>
	<div class="post">
		<div class="balance">
			<div class="order">
				{#if orderUtxo}
					<div class='orderDir'>
						{#if quantity > 0}
							BID
						{:else}
							ASK
						{/if}
					</div>

					<TokenIcon size={24} category={orderUtxo.token_data.category}></TokenIcon>
					<div class="orderText">
						<div>
							<pre>{Number(quantity).toLocaleString(undefined, {}).padStart(12)} <Ticker
									category={binToHex(assetCategory)}
								/></pre>
						</div>

						<div>
							<pre> @ {Number(price).toLocaleString(undefined, {
									minimumFractionDigits: 0,
									maximumFractionDigits: 6
								})} sats </pre>
						</div>
					</div>
				{/if}
			</div>

			<div class="assets">
				{#if quantity > 0}
					<div>
						{Number(value - 800).toLocaleString(undefined, {})} <img width="20px" src={bch} />
					</div>
				{:else}
					<div>
						{Number(amount).toLocaleString(undefined, {})}
						<TokenIcon size={20} category={binToHex(assetCategory)}></TokenIcon>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.container {
		background-color: #f29cf7;
		border-radius: 10px;
		display: flex;
	}
	.post {
				border-radius: 10px;
		padding: 2px 2px 2px 2px;
		background-color: #ffffffdd;
		margin: auto;
		width: 100%;
		border: #bbb solid;
		border-width: 1px;
	}

	.bid{
		background-color: #9ef79e;
	}
	.orderDir {
		font-weight: 700;
		padding: 2px;
		min-width: 30px;
		font-size: small;
	}

	.header {
		display: flex;
	}
	.orderText {
		display: flex;
		flex-wrap: wrap;
		padding: 0px;
	}
	.orderText div {
		padding: 0px;
	}
	.assets {
		display: inline;
	}
	.assets div {
		text-align: end;
		margin: 3px;
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
		word-break: break-all;
	}
	.order {
		align-items: center;
		flex: 1;
		word-break: break-all;
		display: flex;
	}

	.order pre {
		margin: 0px;
		font-weight: 600;
		font-size: x-small;
	}
	.order div p {
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
