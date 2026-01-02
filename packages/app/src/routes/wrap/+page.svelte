<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/state';

	import { binToHex, cashAddressToLockingBytecode, encodeTransactionBch } from '@bitauth/libauth';

	import BCH from '$lib/images/BCH.svg';
	import tBCH from '$lib/images/tBCH.svg';
	import tWBCH from '$lib/images/tWBCH.svg';
	import WBCH from '$lib/images/WBCH.svg';

	import { ElectrumClient, ConnectionStatus } from '@electrum-cash/network';

	import { IndexedDBProvider } from '@mainnet-cash/indexeddb-storage';
	import { BaseWallet, Wallet, TestNetWallet } from 'mainnet-js';

	import { sumUtxoValue, sumTokenAmounts, getScriptHash, getHdPrivateKey } from '@unspent/tau';
	import Wrap from '@unspent/wrap';
	import { WBCH as wbchCat, tWBCH as twbchCat } from '@unspent/wrap';

	import Readme from './README.md';
	import BitauthLink from '$lib/BitauthLink.svelte';
	import CONNECTED from '$lib/images/connected.svg';
	import DISCONNECTED from '$lib/images/disconnected.svg';

	let connectionStatus = $state('');

	let transaction_hex = $state('');
	let transaction: any = $state(undefined);
	let transactionValid = $state(false);
	let sourceOutputs: any = $state();;

	let unspent: any[] = $state([]);
	let walletUnspent: any[] = $state([]);
	let key = '';
	let electrumClient: any = $state();
	let timer: any;
	let scripthash = $state('');
	let walletScriptHash = $state('');
	let sumVaultWrapped = $state(0n);
	let sumVault = $state(0);

	let sumWalletWrapped = $state(0n);
	let sumWallet = $state(0);

	scripthash = Wrap.getScriptHash();
	let contractState = '';

	const isMainnet = page.url.hostname == 'vox.cash';
	const icon = isMainnet ? WBCH : tWBCH;
	const category = isMainnet ? binToHex(wbchCat) : binToHex(twbchCat);
	const baseTicker = isMainnet ? 'BCH' : 'tBCH';
	const ticker = isMainnet ? 'WBCH' : 'tWBCH';
	const prefix = isMainnet ? 'bitcoincash' : 'bchtest';
	const server = isMainnet ? 'bch.imaginary.cash' : 'chipnet.bch.ninja';
	const bchIcon = isMainnet ? BCH : tBCH;

	let spent = new Set();

	let amount = $state(0);
	let wallet: any;
	let transactionError: string | boolean = $state('');

	const debounceUpdateWallet = () => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			updateWallet();
			updateUnspent();
		}, 1500);
	};

	const handleNotifications = function (data: any) {
		if (data.method === 'blockchain.scripthash.subscribe') {
			if (data.params[1] !== contractState) {
				contractState = data.params[1];
				connectionStatus = ConnectionStatus[electrumClient.status];
				amount = 0;
				debounceUpdateWallet();
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
		try {
			let result = Wrap.swap(amount, unspent, walletUnspent, key, category);
			transaction = result.transaction;
			sourceOutputs = result.sourceOutputs;
			transaction_hex = binToHex(encodeTransactionBch(transaction));
			transactionValid = result.verify === true ? true : false;
			if (result.verify === true) transactionError = '';
		} catch (error: any) {
			transaction = undefined;
			sourceOutputs = undefined;
			transaction_hex = '';
			transactionValid = false;
			transactionError = error;
		}
	};

	onMount(async () => {
		BaseWallet.StorageProvider = IndexedDBProvider;
		wallet = isMainnet ? await Wallet.named(`vox`) : await TestNetWallet.named(`vox`);
		key = getHdPrivateKey(wallet.mnemonic!, wallet.derivationPath.slice(0, -2), wallet.isTestnet);
		let bytecodeResult = cashAddressToLockingBytecode(wallet.getDepositAddress());
		if (typeof bytecodeResult == 'string') throw bytecodeResult;
		walletScriptHash = getScriptHash(bytecodeResult.bytecode);

		// Initialize an electrum client.
		electrumClient = new ElectrumClient('unspent/wrap', '1.4.1', server);

		// Wait for the client to connect.
		await electrumClient.connect();
		// Set up a callback function to handle new blocks.

		// Listen for notifications.
		electrumClient.on('notification', handleNotifications);

		// Set up a subscription for new block headers.
		await electrumClient.subscribe('blockchain.scripthash.subscribe', scripthash);
		await electrumClient.subscribe('blockchain.scripthash.subscribe', walletScriptHash);
		updateUnspent();
		updateWallet();
	});

	onDestroy(async () => {
		await electrumClient.disconnect();
	});
</script>

<section>
	<div class="status">
		<BitauthLink template={Wrap.template} />
		{#if connectionStatus == 'CONNECTED'}
			<img src={CONNECTED} alt={connectionStatus} />
		{:else}
			<img src={DISCONNECTED} alt="Disconnected" />
		{/if}
	</div>
	<h1>Wrap Bitcoin Cash as a CashToken</h1>
	{#if connectionStatus == 'CONNECTED'}
		<div class="swap">
			<div>
				<img width="50" src={bchIcon} alt={baseTicker} />
				<br />
				{sumWallet.toLocaleString()} sats {baseTicker}
			</div>
			<div>
				<img width="50" src={icon} alt={ticker} />
				<br />
				{sumWalletWrapped.toLocaleString()} sats {ticker}
			</div>
		</div>
		<div class="swap">
			<input
				type="range"
				bind:value={amount}
				step="1000"
				onchange={() => updateSwap()}
				min={Number(-sumWalletWrapped)}
				max={sumWallet - 2000}
			/>
		</div>

		{#if transaction && transactionValid}
			<div class="swap">
				<div>
					{#if amount > 0}
						place: {amount.toLocaleString()} sats
					{:else if amount < 0}
						redeem: {(-amount).toLocaleString()} wrapped sats
					{/if}
				</div>
			</div>
			<div class="swap">
				<button onclick={() => broadcast(transaction_hex)}>Broadcast</button>
			</div>
		{/if}
		<!-- {#if transaction}
		    <Transaction {transaction} {sourceOutputs} />
	    {/if} -->
		{transactionError}

		<!-- <div class="grid">
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
						{#if (t.token_data && t.token_data.category == category) || !t.token_data}
							<tr>
								<td class="sats">
									{Number(t.value - 800).toLocaleString()}
									<img width="15" src={bch} alt="bchLogo" />
								</td>

								<td class="sats">
									{#if t.token_data}
										{Number(t.token_data.amount).toLocaleString()}
										<img width="15" src={icon} alt="wbchLogo" />
									{/if}
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
		{:else if connectionStatus != 'CONNECTED'}
			<p>No connection ?</p>

			<div class="swap">
				<button onclick={() => reconnect()}>Reconnect</button>
			</div>
		{:else}
			<p>Wallet has no coins or wrapped coins to swap?</p>
		{/if}
	</div> -->

		<!-- <div class="grid">
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
	</div> -->
	{:else}
		<div class="swap">
			<p>Not connected?</p>
		</div>
	{/if}

	<Readme />
</section>

<style>
	.swap {
		display: flex;
	}
	.swap input {
		width: 90%;
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

	.swap input {
		background-color: #ddd;
	}

	.swap button {
		background-color: #a45eb6; /* Green */
		border: none;
		color: white;
		border-radius: 20px;
		padding: 15px 32px;
		text-align: center;
		text-decoration: none;
		display: inline-block;
		font-size: 16px;
	}
	.swap button:hover {
		background-color: #9933b3;
	}
</style>
