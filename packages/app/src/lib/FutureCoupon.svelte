<script lang="ts">
	import { blo } from 'blo';
	import BCH from '$lib/images/BCH.svg';
	import tBCH from '$lib/images/tBCH.svg';
	import FbchIcon from './FbchIcon.svelte';
	let {
		handlePlacement = $bindable(),
		tx_pos,
		tx_hash,
		value,
		placement,
		locktime,
		locale,
		height,
		dateLocale,
		balance,
		couponCount,
		isMainnet
	} = $props();

	let bchIcon = isMainnet ? BCH : tBCH;
	const ticker = isMainnet ? 'BCH' : 'tBCH';
	const fTicker = isMainnet ? 'FBCH' : 'tFBCH';
</script>

<div class="container">
	<div class="post">
		<div class="balance">
			<div>
				<FbchIcon time={locktime} size={48} /><br />
				<img height={24} src={blo(`${tx_hash}:${tx_pos}`, 24)} /> <b>ˣ {couponCount}</b>
			</div>
			<div class="fill">
				<div>
					<a style="color:#75006b; font-weight:600;" href="/future/v?time={locktime}"
						>{fTicker}-{String(locktime).padStart(7, '0')}</a
					><br />
					{dateLocale}
				</div>
				<div class="rate">
					APY: <i>{locale.ypa}%</i>
				</div>
			</div>
			<div class="end">
				<span style="font-size:large">{Number(value).toLocaleString(undefined, {})} sats</span>
				<br />
				{#if balance + Number(value) > placement}
					<button
						class="action"
						onclick={() => {
							handlePlacement({
								tx_hash: tx_hash,
								tx_pos: tx_pos,
								locktime: locktime,
								placement: placement,
								value: value
							});
						}}>place <br><span style="font-weight:700">{Number(placement / 1e8)}</span> {ticker}  </button
					>
				{:else}
					<button class="action" disabled style="font-size:xx-small;">low balance</button>
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
	.balance div {
		padding: 5px;
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
	

	.end {
		text-align: end;
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
		padding: 12px;
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
