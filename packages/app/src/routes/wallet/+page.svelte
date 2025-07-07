<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import walletIcon from '$lib/images/hot.svg';
	import FbchSeriesIcon from '$lib/FbchSeriesIcon.svelte';
	import hot from '$lib/images/hot.svg';
	import bch from '$lib/images/BCH.svg';

	import { blo } from 'blo';

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
			unspent = await wallet.getUtxos();
			console.log(unspent);
		} catch (e) {
			walletError = true;
			throw e;
		}
	});
</script>

<section>
	<div class="status">
		<div class="scanable">
			{#if wallet}
				<qr-code
					id="qr1"
					contents={wallet.getDepositAddress()}
					module-color="#000"
					position-ring-color="#8dc351"
					position-center-color="#ff00ec"
					mask-x-to-y-ratio="1.2"
					style="width: 150px;
                height: 150px;
                margin: 0.5em auto;
                background-color: #fff;"
				>
					<img src={hot} width="30px" slot="icon" />
				</qr-code>
				<p>This is your wallet address.</p>
				<pre id="deposit">{wallet.getDepositAddress()}</pre>
			{/if}
		</div>

		{#if balance >= 0}
			Balance: {balance} BCH
		{/if}
		{#if unspent}
			<h3>unspent outputs (coins)</h3>
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
							<td
								>Sats
								<img width="15" src={bch} alt="bchLogo" />
							</td>
							<td></td>
							<td>Category</td>
							<td>Fungible</td>
							<td>NFT</td>
						</tr>
					</thead>

					<tbody>
						{#each unspent as c, i (c.txid + ':' + c.vout)}
							<tr>
								<td class="r">
									{Number(c.satoshis).toLocaleString(undefined, {})}
								</td>
								<td class="r">
									<i>
										{#if c.token}
											<img
												height="20px"
												src={blo('0x' + c.token?.tokenId)}
												alt={c.token?.tokenId}
											/>
										{/if}
									</i>
								</td>
								<td class="r">
									<i>
										{#if c.token}
											{c.token?.tokenId}
										{/if}
									</i>
								</td>
								<td class="r">
									<i>
										{#if c.token}
											{c.token.amount}
										{/if}
									</i>
								</td>

								<td class="r">
									<i>
										{#if c.token}
											{c.token.commitment}
										{/if}
									</i>
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
			<h3>history</h3>
			{#if history.length > 0}
				{#each history as c, i (c.hash)}
					{#if c.timestamp>0}
						<pre>{new Date(c.timestamp * 1000).toISOString()}</pre>
					{:else}
						<pre>{new Date().toISOString()}</pre>
					{/if}
					<pre># {c.blockHeight}■ {c.hash} </pre>
					<pre>  assets:cash    {c.valueChange.toLocaleString().padStart(14)} sat</pre>
					<pre>  expenses:fees  {c.fee.toLocaleString().padStart(14)} sat # {c.size} bytes</pre>
					{#if c.tokenAmountChanges.length}
						<pre>  assets:tokens  {c.tokenAmountChanges}</pre>
					{/if}
					<pre></pre>
				{/each}
			{:else}
				<p>no history</p>
			{/if}
		{:else}
			<p>loading history...</p>
		{/if}
	</div>
</section>

<style>

	pre {
		margin-block: 0px;
		padding: 0px;
		overflow: hidden;
		white-space: nowrap;
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

		max-width: 90px;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
	}
</style>
