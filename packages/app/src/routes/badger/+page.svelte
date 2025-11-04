<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/state';

	import { binToHex, cashAddressToLockingBytecode, encodeTransactionBCH } from '@bitauth/libauth';

	import Readme from './README.md';

	import bch from '$lib/images/BCH.svg';
	import tBADGER from '$lib/images/tBADGER.svg';
	import BADGER from '$lib/images/BADGER.svg';

	import { ElectrumClient, ConnectionStatus } from '@electrum-cash/network';

	import { IndexedDBProvider } from '@mainnet-cash/indexeddb-storage';
	import { BaseWallet, Wallet, TestNetWallet, hexToBin } from 'mainnet-js';

	import {
		getDefaultElectrum,
		sumUtxoValue,
		sumTokenAmounts,
		getScriptHash,
		getHdPrivateKey,
		type UtxoI
	} from '@unspent/tau';

	import Badger from '@unspent/badgers';

	import BadgerStake, { BADGER as badgerCat, tBADGER as tBadgerCat } from '@unspent/badgers';

	import BitauthLink from '$lib/BitauthLink.svelte';
	import Transaction from '$lib/Transaction.svelte';
	import CONNECTED from '$lib/images/connected.svg';
	import DISCONNECTED from '$lib/images/disconnected.svg';
	import BadgerStakeButton from '$lib/BadgerStakeUtxo.svelte';

	let now = $state(0);
	let connectionStatus = $state('');
	let contractState = $state('');

	let transaction_hex = $state('');
	let transaction: any = undefined;
	let transactionValid = $state(false);
	let sourceOutputs: any = undefined;

	let unspent: any[] = $state([]);
	let walletUnspent: any[] = $state([]);
	let key = $state('');
	let electrumClient: any = $state();
	let scripthash = $state('');
	let walletScriptHash = $state('');

	let sumWallet = $state(0);
	let sumVault = $state(0);

	scripthash = Badger.getScriptHash();

	const isMainnet = page.url.hostname == 'vox.cash';
	const icon = isMainnet ? BADGER : tBADGER;
	const category = isMainnet ? binToHex(badgerCat) : binToHex(tBadgerCat);
	const baseTicker = isMainnet ? 'BCH' : 'tBCH';
	const ticker = isMainnet ? 'BADGER' : 'tBADGER';
	const prefix = isMainnet ? 'bitcoincash' : 'bchtest';
	const server = getDefaultElectrum(isMainnet);

	let spent = new Set();
	let timer: any = 0;
	let amount = 0;
	let wallet: any;
	let transactionError: string | boolean = '';

	const handleNotifications = async function (data: any) {
		if (data.method === 'blockchain.headers.subscribe') {
			let d = data.params[0];
			now = d.height;
			updateUnspent();
		} else if (data.method === 'blockchain.scripthash.subscribe') {
			if (data.params[1] !== contractState) {
				contractState = data.params[1];
				connectionStatus = ConnectionStatus[electrumClient.status];
				amount = 0;
				//debounceUpdateWallet();
			}
		} else {
			console.log(data);
		}
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
			unspent = response
				.filter((u) => u.token_data.nft.capability == 'mutable')
				.map((u) => {
					return {
						...u,
						...BadgerStake.parseNFT(u),
						...{ now: now }
					};
				});
		}
	};

	onMount(async () => {
		BaseWallet.StorageProvider = IndexedDBProvider;
		wallet = isMainnet ? await Wallet.named(`vox`) : await TestNetWallet.named(`vox`);

		key = getHdPrivateKey(wallet.mnemonic!, wallet.derivationPath.slice(0, -2), wallet.isTestnet);
		let lockingCodeResult = cashAddressToLockingBytecode(wallet.getDepositAddress());
		if (typeof lockingCodeResult == 'string') throw lockingCodeResult;
		walletScriptHash = getScriptHash(lockingCodeResult.bytecode);

		// Initialize an electrum client.
		electrumClient = new ElectrumClient(Badger.USER_AGENT, '1.4.1', server);

		// Wait for the client to connect.
		await electrumClient.connect();
		// Set up a callback function to handle new blocks.

		// Listen for notifications.
		electrumClient.on('notification', handleNotifications);

		// Set up a subscription for new block headers.
		await electrumClient.subscribe('blockchain.scripthash.subscribe', scripthash);
		await electrumClient.subscribe('blockchain.scripthash.subscribe', walletScriptHash);
		await electrumClient.subscribe('blockchain.headers.subscribe');
	});

	onDestroy(async () => {
		const electrumClient = new ElectrumClient(Badger.USER_AGENT, '1.4.1', server);
		await electrumClient.disconnect();
	});
</script>

<section>
	<div class="status">
		<BitauthLink template={Badger.template} />
		{#if connectionStatus == 'CONNECTED'}
			<img src={CONNECTED} alt={connectionStatus} />
		{:else}
			<img src={DISCONNECTED} alt="Disconnected" />
		{/if}
	</div>

	<!-- <div class="swap">
		<div>
			<img width="50" src={bch} alt={baseTicker} />
			<br />
			{sumWallet.toLocaleString()} sats {baseTicker}
		</div>
		<div>
			<img width="50" src={icon} alt={ticker} />
			<br />
			{sumVault.toLocaleString()}
			{ticker}
		</div>
	</div> -->

	{#if unspent.length}
		<h3>Current Stakes</h3>
		<div class="grid">
			{#if unspent.filter((i: any) => i.height > 0).length > 0}
				{#each unspent.filter((i: any) => i.height > 0) as item, index}
					<div class="row">
						<BadgerStakeButton {...item} />
					</div>
				{/each}
			{:else}
				<p>No staked coins?</p>
			{/if}
		</div>
	{/if}

	<Readme />
</section>

<style>
	.swap {
		display: flex;
	}
	.status {
		text-align: end;
	}

	.swap {
		display: flex;
		margin: auto;
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

	.action {
		display: inline-block;
		border-radius: 10px;
		background-color: rgba(255, 255, 255, 0.781);
		/* color: #000000; */
		border: #ffffff solid;
		margin: auto;
		padding: 10px;
		font-weight: 900;
		font-size: small;
		filter: drop-shadow(8px 8px 16px #ffffff);
	}

	.action:disabled {
		display: inline-block;
		border-radius: 10px;
		background-color: #adadad;
		color: #000000;
		margin: 1px;
		padding: 0 5px 0 5px;
		font-weight: 900;
		font-size: small;
	}

	.grid {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		align-items: flex-start;
	}

	.grid .row {
		flex: 1 1 180px;
		justify-content: center;
		align-items: center;
		text-align: right;
		grid-gap: 0.2rem;
		margin: 0 0 0.2rem 0;
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
