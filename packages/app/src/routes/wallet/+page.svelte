<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import walletIcon from '$lib/images/hot.svg';
	import hot from '$lib/images/hot.svg';
	import bch from '$lib/images/BCH.svg';

	import { stringify, swapEndianness } from '@bitauth/libauth';
	import { blo } from 'blo';

	import { ElectrumClient, ConnectionStatus } from '@electrum-cash/network';

	import { IndexedDBProvider } from '@mainnet-cash/indexeddb-storage';
	import { BaseWallet, Wallet, TestNetWallet, TokenSendRequest } from 'mainnet-js';

	import CONNECTED from '$lib/images/connected.svg';
	import DISCONNECTED from '$lib/images/disconnected.svg';

	let data;
	let wallet: any;
	let walletState = '';
	let walletError = false;
	let balance: number;
	let history: any[];
	let unspent: any[];
	let showInfo = false;

	async function consolidateFungibleTokens() {
		const cashaddr = wallet.getTokenDepositAddress();
		let utxos = (await wallet.getUtxos())
			.filter((u: any) => u.token)
			.filter((u: any) => !u.token.capability);
		console.log(utxos);
		// Get a list of
		const categories = [
			...new Set(
				utxos.map((u: any) => {
					return u.token.tokenId;
				})
			)
		];

		let sendRequests = categories.map((tokenId: any) => {
			const sumTokens = utxos
				.filter((u: any) => u.token.tokenId == tokenId && u.token.amount > 0n)
				.map((u: any) => u.token.amount || 0n)
				.reduce((a: any, b: any) => a + b, 0n);
			return new TokenSendRequest({
				cashaddr: cashaddr,
				value: 800,
				amount: sumTokens,
				tokenId: tokenId
			});
		});

		return await wallet.send(sendRequests);
	}

	async function consolidateSats() {
		return await wallet.sendMax(wallet.getDepositAddress());
	}

	const toggleSeed = () => {
		showInfo = !showInfo;
	};

	onMount(async () => {
		try {
			const isTestnet = page.url.hostname !== 'vox.cash';
			BaseWallet.StorageProvider = IndexedDBProvider;
			wallet = isTestnet ? await TestNetWallet.named(`vox`) : await Wallet.named(`vox`);
			console.log(wallet.toDbString());
			balance = await wallet.getBalance('sat');

			unspent = await wallet.getUtxos();
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
				<p id="deposit">{wallet.getDepositAddress()}</p>
			{/if}
			{#if balance >= 0}
				<div>
					<br />
					<b>
						{balance.toLocaleString()} satoshis
					</b>
				</div>
			{/if}
			<div class="walletHead">
				<button onclick={toggleSeed}>Show/hide backup</button>
			</div>
			{#if showInfo}
			<h3>DO NOT SHARE WITH ANYONE!</h3>
				<p>
					{wallet.toDbString()}
				</p>
				Note: vox.cash {new Date().toLocaleDateString()}
			{/if}
		</div>

		{#if unspent}
			{#if unspent.length > 0}
				

				<h3>Unspent Outputs (coins)</h3>
				<table class="wallet">
					<thead>
						<tr class="header">
							<td></td>
							<td>Token</td>
							<td>Fungible</td>
							<td>NFT</td>
							<td
								>Sats
								<img width="15" src={bch} alt="bchLogo" />
							</td>
						</tr>
					</thead>

					<tbody>
						{#each unspent as c, i (c.txid + ':' + c.vout)}
							<tr>
								<td class="r">
									<i>
										{#if c.token}
											<img height="64px" src={blo(c.token?.tokenId, 16)} alt={c.token?.tokenId} />
										{:else}
											<img width="64px" src={bch} alt="bchLogo" />
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
								<td class="r">
									{Number(c.satoshis).toLocaleString(undefined, {})}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>

				<div class="walletHead">
					<!-- <div>
						<img width="32" src={walletIcon} alt="hotWallet" />
					</div> -->
					<button onclick={() => consolidateFungibleTokens()}> Consolidate Tokens</button>
					<button onclick={() => consolidateSats()}> Consolidate Sats</button>
					<!-- <button on:click={() => shapeWallet()}> Shape</button>
					<button on:click={() => sendMaxTokens()}> Sweep FBCH</button>
					<button on:click={() => sendMax()}> Sweep BCH</button> -->
				</div>
			{:else}
				<p>no wallet utxos available</p>
			{/if}
		{:else}
			<p>loading wallet...</p>
		{/if}

		{#if wallet}
			{#await wallet.getHistory('sat', 0, 10, true)}
				<p>...getting history</p>
			{:then history}
				<h3>History</h3>
				{#if history.length > 0}
					{#each history as c, i (c.hash)}
						{#if c.timestamp > 0}
							<pre>{new Date(c.timestamp * 1000).toISOString()}</pre>
						{:else}
							<pre>{new Date().toISOString()}</pre>
						{/if}
						<pre># {c.blockHeight}■ {c.hash} </pre>
						<pre>  assets:cash    {c.valueChange.toLocaleString().padStart(14)} sat</pre>
						<pre>  expenses:fees  {c.fee.toLocaleString().padStart(14)} sat # {c.size} bytes</pre>
						{#each c.tokenAmountChanges as tokenChange}
							{#if tokenChange.amount != 0n}
								<pre>  assets:cash:tokens  {tokenChange.amount.toLocaleString()} {tokenChange.tokenId} </pre>
							{/if}
						{/each}
						<pre>   &nbsp;</pre>
					{/each}
				{:else}
					<p>no history</p>
				{/if}
			{:catch error}
				<p style="color: red">{error.message}</p>
			{/await}
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

	table {
		width: 100%;
		border-collapse: separate;
	}
	thead tr {
		text-align: center;
		font-weight: 900;
	}

	tbody tr:nth-child(odd) {
		background-color: #fd70da2a;
	}
	tbody tr:nth-child(even) {
		background-color: #e495e42c;
	}
	tbody tr {
		border-radius: 10px;
	}
	tbody tr td {
		padding: 4px;
	}

	.scanable {
		padding: 60px;
		background-color: white;
	}
	.scanable div {
		text-align: center;
	}

	.walletHead button {
		background-color: #a45eb6; /* Green */
		border: none;
		color: white;
		padding: 15px 32px;
		border-radius: 20px;
		text-align: center;
		text-decoration: none;
		display: inline-block;
		font-size: 16px;
	}

	.walletHead {
		padding: 15px 32px;
		display: flex;
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
