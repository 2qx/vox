<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import walletIcon from '$lib/images/hot.svg';
	import FbchSeriesIcon from '$lib/FbchSeriesIcon.svelte';
	import bch from '$lib/images/BCH.svg';

	import { ElectrumClient, ConnectionStatus } from '@electrum-cash/network';

	import { IndexedDBProvider } from '@mainnet-cash/indexeddb-storage';
	import { BaseWallet, Wallet, TestNetWallet } from 'mainnet-js';

	import { CATEGORY_MAP } from '@fbch/lib';

	import CONNECTED from '$lib/images/connected.svg';
	import DISCONNECTED from '$lib/images/disconnected.svg';

	let data;
	let wallet: any;
	let walletError = false;
	let balance: number;
	let history: any[];
	let unspent: any[];

	let heightValue;

	onMount(async () => {
		try {
			const isTestnet = page.url.hostname !== 'vox.cash';
			BaseWallet.StorageProvider = IndexedDBProvider;
			wallet = isTestnet ? await TestNetWallet.named(`vox`) : await Wallet.named(`vox`);
			balance = await wallet.getBalance('sat');
			history = await wallet.getHistory('sat', 0, 20, true);
			console.log(history);
			unspent = await wallet.getUtxos();
		} catch (e) {
			walletError = true;
			throw e;
		}
	});
</script>

<section>
	<div class="status">
		{#if wallet}
			{balance}

			{wallet.getDepositAddress()}
		{/if}

		{#if unspent}
			{#if unspent.length > 0}
				<div class="walletHead">
					<!-- <img width="15" src={walletIcon} alt="hotWallet" /> -->
					<!-- <button on:click={() => shapeWallet()}> Shape</button>
					<button on:click={() => sendMaxTokens()}> Sweep FBCH</button>
					<button on:click={() => sendMax()}> Sweep BCH</button> -->
				</div>

				<table class="wallet">
					<thead>
						<tr class="header">
							<td>BCH </td>
							<td>CashToken</td>
							<td>Series</td>
							<td>action</td>
						</tr>
					</thead>

					<tbody>
						{#each unspent as c, i (c.txid + ':' + c.vout)}
							<tr>
								<td class="r">
									{#if Number(c.satoshis) > 800}
										{(Number(c.satoshis) / 1e8).toLocaleString(undefined, {
											minimumFractionDigits: 3
										})}
										<img width="15" src={bch} alt="bchLogo" />
									{/if}
								</td>
								<td class="r">
									<i>
										{#if c.token}
											{(Number(c.token.amount) / 1e8).toLocaleString(undefined, {
												minimumFractionDigits: 3
											})}
											<FbchSeriesIcon time={CATEGORY_MAP.get(c.token?.category)} size="15" />
										{/if}
									</i>
								</td>
								<td class="r">
									{#if c.token}
										{#if CATEGORY_MAP.has(c.token.category)}
											<a href="/v?block={CATEGORY_MAP.get(c.token?.category)}">
												{String(CATEGORY_MAP.get(c.token?.category)).padStart(7, '0')}
											</a>
										{/if}
									{/if}
								</td>

								<td style="width:30px; text-align:center;">
									{#if c.token}
										{#if CATEGORY_MAP.get(c.token?.category) <= Number(heightValue)}
											<button class="action">redeem </button>
										{:else}
											<button class="action" disabled>
												T{Number(heightValue) - CATEGORY_MAP.get(c.token?.category)}<sub>■</sub>
											</button>
										{/if}
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{:else}
				<p>no wallet utxos available</p>
			{/if}
		{:else}
			<p>loading wallet...</p>
		{/if}

		{#if history}
			<h3>ledger</h3>
			{#if history.length > 0}
				{#each history as c, i (c.txid + ':' + c.vout)}
					<pre># {c.blockHeight}■ {new Date(c.timestamp * 1000).toISOString()}</pre>
					<pre># {c.hash}</pre>
					<pre>  assets:cash    {c.valueChange.toLocaleString().padStart(16)} sat</pre>
					<pre>  expenses:fees  {c.fee.toLocaleString().padStart(16)} sat</pre>
					{#if c.tokenAmountChanges.length}
						<pre>  assets:tokens  {c.tokenAmountChanges}</pre>
					{/if}
				{/each}
			{:else}
				<p>no wallet utxos available</p>
			{/if}
		{:else}
			<p>loading wallet...</p>
		{/if}
	</div>
</section>

<style>
	ul {
		list-style: none;
	}
	textarea {
		width: 90%;
		border-radius: 10px;
		background: #f4ffee;
		border-width: 5px;
		font-weight: 500;
	}

	pre {
		margin-block: 0px;
		padding: 0px;
		overflow: hidden;
	}

	.action {
		display: inline-block;
		border-radius: 10px;
		background-color: #fa1ad5;
		color: #fff;
		margin: 1px;
		padding: 1px;
		font-weight: 900;
		font-size: small;
	}

	.action:disabled {
		display: inline-block;
		border-radius: 10px;
		background-color: #80748069;
		color: #ffffff;
		margin: 1px;
		padding: 1px;
		font-weight: 900;
		font-size: small;
	}

	.styled {
		border-color: #000;
		font-size: 1rem;
		line-break: anywhere;
		text-align: center;
		color: #000;
		border-radius: 10px;
		background-color: #ffe2ff;
		font-weight: 700;
		padding: 5px;
		box-shadow:
			inset 2px 2px 3px rgba(255, 255, 255, 0.6),
			inset -2px -2px 3px rgba(0, 0, 0, 0.6);
	}

	.styled:hover {
		background-color: rgb(238, 54, 255);
	}

	.styled:active {
		box-shadow:
			inset -2px -2px 3px rgba(255, 255, 255, 0.6),
			inset 2px 2px 3px rgba(0, 0, 0, 0.6);
	}
	thead tr {
		text-align: center;
		font-weight: 900;
	}
	tbody tr:nth-child(odd) {
		background-color: #ff33cc1f;
	}
	tbody tr:nth-child(even) {
		background-color: #e495e41a;
	}
	.r {
		text-align: right;
		vertical-align: middle;
	}
</style>
