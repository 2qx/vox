<script lang="ts">
	import BCH from '$lib/images/BCH.svg';
	import tBCH from '$lib/images/tBCH.svg';

	import { binToHex } from '@bitauth/libauth';
	import TokenNftData from './TokenNftData.svelte';
	import Ticker from './Ticker.svelte';
	import TokenIcon from './TokenIcon.svelte';
	let {
		authCategory,
		assetCategory,
		orderUtxo,
		assetUtxo,
		price,
		amount,
		quantity,
		value,
		isMainnet
	} = $props();
	let bid = $derived(quantity < 0);

	let bchIcon = isMainnet ? BCH : tBCH;
</script>

<div class={['container', { bid }]}>
	<div class="post">
		<div class="balance">
			<div class="order">
				{#if orderUtxo}
					<div class="auth">
						<TokenIcon size={20} category={orderUtxo.token_data.category}></TokenIcon>
					</div>
					<div class="orderDir">
						{#if quantity > 0}
							BID
						{:else}
							ASK
						{/if}
					</div>
					<div class="quantity">
						{Number(quantity).toLocaleString(undefined, {}).padStart(12)}
					</div>
					<div>
						<TokenIcon size={24} category={assetCategory} {isMainnet} />
					</div>
					<div class="price">
						•
						{Number(price).toLocaleString(undefined, {
							minimumFractionDigits: 0,
							maximumFractionDigits: 6
						})}
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

	.bid {
		background-color: #9ef79e;
	}

	.orderDir {
		font-weight: 700;
		color: #00000088;
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
	.quantity {
		white-space: pre-wrap;
		font-size: larger;
		font-weight: 500;
		text-align: end;
		min-width: 110px;
	}
	.price {
		display: inline;

		min-width: 70px;
		font-size:x-large;
		
		font-weight: 600;
		text-align: start;
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
		margin: 2px;
	}

	.order pre {
		margin: 0px;
		font-weight: 700;
		font-size: x-small;
	}
	.order div {
		padding: 3px;
	}
	.timestamp {
		font-size: xx-small;
		font-weight: 200;
		color: #777;
		word-break: break-all;
	}
	.auth {
		opacity: 0.9;
		align-content: center;
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
