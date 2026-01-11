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
	let bid = $derived(quantity > 0);

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
					<div class="price">
						{Number(price).toLocaleString(undefined, {
							minimumFractionDigits: 0,
							maximumFractionDigits: 6
						})}
					</div>

					<div class="quantity">
						{Number(quantity).toLocaleString(undefined, {}).padStart(12)}
						<TokenIcon size={20} category={assetCategory} {isMainnet} />
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
		padding: 0px;
		background-color: #ffffffdd;
		margin: auto;
		width: 100%;
		border: #bbb solid;
		border-width: 1px;
	}

	.bid {
		background-color: #9ef79e;
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
		font-size: small;
		font-weight: 500;
		text-align: end;
	}
	.price {
		min-width: 45px;
		font-size: medium;
		font-weight: 600;
		text-align: end;
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
		justify-content: space-between;
		align-items: center;
	}

	.order pre {
		margin: 0px;
		font-weight: 700;
		font-size: x-small;
	}
	.order div {
		padding: 2px;
	}
	.timestamp {
		font-size: xx-small;
		font-weight: 200;
		color: #777;
		word-break: break-all;
	}
	.auth {
		display: flex;
		opacity: 0.9;
		align-content: center;
	}

	.error {
		color: brown;
	}
</style>
