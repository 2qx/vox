<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/state';

	import { binToHex, cashAddressToLockingBytecode, decodeTransactionBCH } from '@bitauth/libauth';

	import bch from '$lib/images/BCH.svg';
	import tWBCH from '$lib/images/tWBCH.svg';
	import WBCH from '$lib/images/WBCH.svg';

	import { ElectrumClient, ConnectionStatus } from '@electrum-cash/network';

	import { IndexedDBProvider } from '@mainnet-cash/indexeddb-storage';
	import { BaseWallet, Wallet, TestNetWallet, hexToBin } from 'mainnet-js';

	import { sumUtxoValue, sumTokenAmounts, getScriptHash, getHdPrivateKey } from '@unspent/tau';
	import Wrap from '@unspent/wrap';
	import { WBCH as wbchCat, tWBCH as twbchCat } from '@unspent/wrap';

	import Readme from './README.md';
	import BitauthLink from '$lib/BitauthLink.svelte';
	import CONNECTED from '$lib/images/connected.svg';
	import DISCONNECTED from '$lib/images/disconnected.svg';
	let connectionStatus = '';

	let transaction_hex = '';
	let transaction: any = undefined;

	let unspent: any[] = [];
	let walletUnspent: any[] = [];
	let key = '';
	let electrumClient: any;
	let scripthash = '';
	let walletScriptHash = '';
	let sumVaultWrapped = 0n;
	let sumVault = 0;

	let sumWalletWrapped = 0n;
	let sumWallet = 0;

	scripthash = Wrap.getScriptHash();
	let contractState = '';

	const isMainnet = page.url.hostname == 'vox.cash';
	let icon = isMainnet ? WBCH : tWBCH;
	let category = isMainnet ? binToHex(wbchCat) : binToHex(twbchCat);
	let baseTicker = isMainnet ? 'BCH' : 'tBCH';
	let ticker = isMainnet ? 'WBCH' : 'tWBCH';
	let prefix = isMainnet ? 'bitcoincash' : 'bchtest';

	let server = isMainnet ? 'bch.imaginary.cash' : 'chipnet.bch.ninja';

	let spent = new Set();

	let amount = 0;
	let wallet: any;
	let transactionError = '';
	let balance: number;
	let history: any[];

	const handleNotifications = function (data: any) {
		if (data.method === 'blockchain.scripthash.subscribe') {
			if (data.params[1] !== contractState) {
				contractState = data.params[1];
				connectionStatus = ConnectionStatus[electrumClient.status];
				updateUnspent();
				updateWallet();
			}
		} else {
			console.log(data);
		}
	};

	const updateWallet = async function () {
		let response = await electrumClient.request(
			'blockchain.scripthash.listunspent',
			walletScriptHash,
			'include_tokens'
		);
		if (response instanceof Error) throw response;
		let walletUnspentIds = new Set(response.map((utxo: any) => `${utxo.tx_hash}":"${utxo.tx_pos}`));
		if (walletUnspent.length == 0 || spent.intersection(walletUnspentIds).size == 0) {
			walletUnspent = response;
		}
		walletUnspent = walletUnspent.filter((t) => !t.token_data || t.token_data.category == category);
		sumWallet = sumUtxoValue(walletUnspent, true);
		sumWalletWrapped = sumTokenAmounts(walletUnspent, category);
		
	};

	const updateUnspent = async function () {
		let response = await electrumClient.request(
			'blockchain.scripthash.listunspent',
			scripthash,
			'include_tokens'
		);
		if (response instanceof Error) throw response;
		let unspentIds = new Set(response.map((utxo: any) => `${utxo.tx_hash}":"${utxo.tx_pos}`));
		if (unspent.length == 0 || spent.intersection(unspentIds).size == 0) {
			unspent = response;
		}
		unspent = unspent.filter((t) => t.token_data && t.token_data.category == category);
		sumVault = sumUtxoValue(unspent, true);
		sumVaultWrapped = sumTokenAmounts(unspent, category);
	};

	const broadcast = async function (raw_tx: string) {
		let response = await electrumClient.request('blockchain.transaction.broadcast', raw_tx);
		if (response instanceof Error) {
			connectionStatus = ConnectionStatus[electrumClient.status];
			throw response;
		}
		response as any[];
	};

	const updateSwap = function () {
		let vaultUtxo =
			amount > 0
				? unspent.filter((u) => u.token_data.amount > amount)[0]
				: unspent.filter((u) => u.value > -amount)[0];
				console.log(walletUnspent)
		try {
			transaction_hex = Wrap.swap(amount, vaultUtxo, walletUnspent, key, category);
			transactionError = '';
		} catch (error: any) {
			transactionError = error;
		}

		transaction = decodeTransactionBCH(hexToBin(transaction_hex));
	};

	onMount(async () => {
		const isMainnet = page.url.hostname !== 'vox.cash';
		BaseWallet.StorageProvider = IndexedDBProvider;
		wallet = isMainnet ? await TestNetWallet.named(`vox`) : await Wallet.named(`vox`);
		key = getHdPrivateKey(wallet.mnemonic!, wallet.derivationPath.slice(0, -2), wallet.isTestnet);
		let lockcodeResult = cashAddressToLockingBytecode(wallet.getDepositAddress());
		if (typeof lockcodeResult == 'string') throw lockcodeResult;
		walletScriptHash = getScriptHash(lockcodeResult.bytecode);
		balance = await wallet.getBalance('sat');
		history = await wallet.getHistory('sat', 0, 20, true);
		

		// Initialize an electrum client.
		electrumClient = new ElectrumClient('unspent/wrap', '1.4.1', server);

		// Wait for the client to connect.
		await electrumClient.connect();
		// Set up a callback function to handle new blocks.

		// Listen for notifications.
		electrumClient.on('notification', handleNotifications);

		// Set up a subscription for new block headers.
		await electrumClient.subscribe('blockchain.scripthash.subscribe', scripthash);
		updateUnspent();
		updateWallet();
	});

	onDestroy(async () => {
		const electrumClient = new ElectrumClient('unspent/wrap', '1.4.1', server);
		await electrumClient.disconnect();
	});

</script>

<section>
	<div class="status">
		{#if connectionStatus == 'CONNECTED'}
			<img src={CONNECTED} alt={connectionStatus} />
		{:else}
			<img src={DISCONNECTED} alt="Disconnected" />
		{/if}
		<BitauthLink template={Wrap.template} />
	</div>
	<h2>Wrap Bitcoin Cash as a CashToken</h2>

	<div class="swap">
		<div>
			<img width="50" src={bch} alt={baseTicker} />

			<br />
			{sumWallet.toLocaleString()} <b>{baseTicker}</b>
		</div>
		<div>
			<img width="50" src={icon} alt={ticker} />
			<br />
			{sumWalletWrapped.toLocaleString()} <b>{ticker}</b>
		</div>
	</div>
	<input
		style="width:100%;"
		type="range"
		bind:value={amount}
		onchange={() => updateSwap()}
		min={Number(-sumWalletWrapped)}
		max={sumWallet}
	/>
	<button onclick={() => broadcast(transaction_hex)}>Submit </button>

	<div class="swap">
		<div>
			swap: {amount.toLocaleString()} sats
		</div>
	</div>
	{transaction}
	{transactionError}

    <div class="grid">
		{#if walletUnspent.length > 0}
			<h4>Wallet Unspent Transaction Outputs (coins)</h4>
			<table>
				<thead>
					<tr class="header">
						<td>BCH</td>
						<td>WBCH</td>
					</tr>
					<tr class="units">
						<td class="r">sats </td>
						<td class="r">sats </td>
					</tr>
				</thead>

				<tbody>
					{#each walletUnspent as t}
						{#if t.token_data && t.token_data.category == category}
							<tr>
								<td class="sats">
									{Number(t.value - 800).toLocaleString()}
									<img width="15" src={bch} alt="bchLogo" />
								</td>

								<td class="sats">
									{Number(t.token_data.amount).toLocaleString()}
									<img width="15" src={icon} alt="wbchLogo" />
								</td>
							</tr>
						{/if}
					{/each}
					<tr style="border-top: solid thin;">
						<td class="r">
							<b>{sumWallet.toLocaleString()} </b>
							<img width="15" src={bch} alt="bchLogo" />
						</td>
						<td class="r">
							<b>{Number(sumWalletWrapped).toLocaleString()} </b>
							<img width="15" src={icon} alt="wbchLogo" />
						</td>
					</tr>
				</tbody>
			</table>
		{:else}
			<p>... getting wallet threads.</p>
		{/if}
	</div>

	<div class="grid">
		{#if unspent.length > 0}
			<h4>{ticker} Vault Threads</h4>
			
			<table>
				<thead>
					<tr class="header">
						<td>BCH</td>
						<td>WBCH</td>
					</tr>
					<tr class="units">
						<td class="r">sats </td>
						<td class="r">sats </td>
					</tr>
				</thead>

				<tbody>
					{#each unspent as t}
						{#if t.token_data && t.token_data.category == category}
							<tr>
								<td class="sats">
									{Number(t.value - 800).toLocaleString()}
									<img width="15" src={bch} alt="bchLogo" />
								</td>

								<td class="sats">
									{Number(t.token_data.amount).toLocaleString()}
									<img width="15" src={icon} alt="wbchLogo" />
								</td>
							</tr>
						{/if}
					{/each}
					<tr style="border-top: solid thin;">
						<td class="r">
							<b>{sumVault.toLocaleString()} </b>
							<img width="15" src={bch} alt="bchLogo" />
						</td>
						<td class="r">
							<b>{Number(sumVaultWrapped).toLocaleString()} </b>
							<img width="15" src={icon} alt="wbchLogo" />
						</td>
					</tr>
				</tbody>
			</table>
		{:else}
			<p>... getting wrapped vault threads.</p>
		{/if}
	</div>
    
	<Readme />
</section>

<style>
	.swap {
		display: flex;
	}
	.status {
		text-align: end;
	}

	thead tr td {
		border: 2px ridge rgba(247, 202, 248, 0.6);
		background-color: #ffffff5b;
	}

	thead tr:nth-child(odd) {
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
	}
	.sats {
		text-align: right;
		font-weight: 300;
		font-style: italic;
	}

	tbody tr td {
		border: 2px ridge rgba(247, 202, 248, 0.6);
	}

	.swap {
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.swap div {
		padding: 20px;
		justify-content: center;
		text-align: center;
	}
</style>
