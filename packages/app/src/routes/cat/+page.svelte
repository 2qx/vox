<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/state';

	import Chat from '$lib/Chat.svelte';
	import Transaction from '$lib/Transaction.svelte';
	import Utxo from '$lib/Utxo.svelte';

	import BCMR from '$lib/bitcoin-cash-metadata-registry.json' with { type: 'json' };
	import tBCMR from '$lib/chipnet-metadata-registry.json' with { type: 'json' };

	import Readme from './README.md';

	import CatDex from '@unspent/catdex';

	import SmallIndex from '@unspent/small';

	import BitauthLink from '$lib/BitauthLink.svelte';
	import CONNECTED from '$lib/images/connected.svg';
	import DISCONNECTED from '$lib/images/disconnected.svg';

	import {
		binToHex,
		cashAddressToLockingBytecode,
		encodeTransactionBch,
		stringify
	} from '@bitauth/libauth';

	import { ElectrumClient, ConnectionStatus } from '@electrum-cash/network';
	import { BaseWallet, Wallet, TestNetWallet, NFTCapability } from 'mainnet-js';

	import { IndexedDBProvider } from '@mainnet-cash/indexeddb-storage';

	import bch from '$lib/images/BCH.svg';

	import {
		cashAssemblyToHex,
		getScriptHash,
		getHdPrivateKey,
		sumUtxoValue,
		sumTokenAmounts,
		type UtxoI
	} from '@unspent/tau';

	let now: number = $state(0);

	let key = $state('');
	let coupons: any[] | undefined = $state();
	let electrumClient: any;
	let walletScriptHash = $state('');
	let amount = $state(0n);
	let connectionStatus = $state('');
	let contractState = $state('');
	let timer: any;

	let unspent: any[] = $state([]);
	let walletUnspent: any[] = $state([]);
	let markets: any[] = $state([]);
	let authBatons: any[] = $state([]);
	let showSettings = $state(false);

	let selectedAsset = $state("");

	let transaction_hex = '';
	let transaction: any = $state(undefined);
	let transactionValid = $state(false);
	let sourceOutputs: any = $state();
	let transactionError: string | boolean = $state('');

	let balance = $state(0);
	let assetBalance = $state(0n);

	const isMainnet = page.url.hostname == 'vox.cash';
	const prefix = isMainnet ? 'bitcoincash' : 'bchtest';
	const server = isMainnet ? 'bch.imaginary.cash' : 'chipnet.bch.ninja';
	const metadata = isMainnet ? BCMR : tBCMR;

	const protocol_prefix = cashAssemblyToHex(`OP_RETURN <"${CatDex.PROTOCOL_IDENTIFIER}">`);

	let wallet: any;

	const bcmr = Object.entries(metadata.identities)
		.map((o) => {
			return Object.values(Object.values(o[1]));
		})
		.flat()
		.reduce((acc, o) => {
			acc.set(o.token.category, o);
			return acc;
		}, new Map());

	const debounceUpdateWallet = () => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			updateWallet();
			//updateUnspent();
		}, 1500);
	};

	async function updateOrders() {
		if (electrumClient && now > 1000) {
			markets = await electrumClient.request(
				'blockchain.scripthash.listunspent',
				SmallIndex.getScriptHash(selectedAsset),
				'include_tokens'
			);

			let authCats = markets.map((u:UtxoI) => u.token_data?.category)
			const orders = CatDex.getCatDexOrdersFromUtxos(authCat, selectedAsset, utxos)
		}
	}

	const updateWallet = async function () {
		let response = await electrumClient.request(
			'blockchain.scripthash.listunspent',
			walletScriptHash,
			'include_tokens'
		);
		if (response instanceof Error) throw response;
		let walletUnspentIds = new Set(response.map((utxo: any) => `${utxo.tx_hash}":"${utxo.tx_pos}`));

		if (walletUnspent.length == 0) {
			walletUnspent = response;
		}

		authBatons = response.filter(
			(u: UtxoI) =>
				u.token_data && u.token_data.nft && u.token_data.nft.commitment.startsWith(protocol_prefix)
		);
		balance = sumUtxoValue(walletUnspent, true);
		if (typeof selectedAsset == 'string') {
			assetBalance = sumTokenAmounts(walletUnspent, selectedAsset);
		} else {
			assetBalance = 0n;
		}
	};

	const newAuthBaton = async function () {
		await wallet.sendMax(wallet.getDepositAddress());
		let uname = cashAssemblyToHex(
			`OP_RETURN <"${CatDex.PROTOCOL_IDENTIFIER}"> <"market auth baton">`
		);
		let sendResponse = await wallet.tokenGenesis({
			cashaddr: wallet.getTokenDepositAddress()!, // token UTXO recipient, if not specified will default to sender's address
			commitment: uname, // NFT Commitment message
			capability: NFTCapability.minting, // NFT capability
			value: 800 // Satoshi value
		});
	};

	const updateAsset = async function () {
		if (typeof selectedAsset == 'string') {
			let smallDb = SmallIndex.getScriptHash(selectedAsset);
			markets = await electrumClient.request(
				'blockchain.scripthash.listunspent',
				smallDb,
				'include_tokens'
			);

			assetBalance = sumTokenAmounts(walletUnspent, selectedAsset);
		} else {
			assetBalance = 0n;
		}
	};

	const updateSwap = function () {
		try {
			let result = CatDex.swap(amount, unspent, walletUnspent, key);
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

	const handleNotifications = function (data: any) {
		connectionStatus = ConnectionStatus[electrumClient.status];
		if (data.method === 'blockchain.headers.subscribe') {
			let d = data.params[0];
			now = d.height;
			updateOrders();
			updateWallet();
		} else if (data.method === 'blockchain.scripthash.subscribe') {
			if (data.params[1] !== contractState) {
				contractState = data.params[1];
				amount = 0n;
				debounceUpdateWallet();
			}
		} else {
			console.log(data);
		}
	};

	onMount(async () => {
		BaseWallet.StorageProvider = IndexedDBProvider;
		wallet = isMainnet ? await Wallet.named(`vox`) : await TestNetWallet.named(`vox`);

		key = getHdPrivateKey(wallet.mnemonic!, wallet.derivationPath.slice(0, -2), wallet.isTestnet);
		let lockcodeResult = cashAddressToLockingBytecode(wallet.getDepositAddress());
		if (typeof lockcodeResult == 'string') throw lockcodeResult;
		walletScriptHash = getScriptHash(lockcodeResult.bytecode);

		// Initialize an electrum client.
		electrumClient = new ElectrumClient(CatDex.USER_AGENT, '1.4.1', server);

		// Wait for the client to connect.
		await electrumClient.connect();
		// Set up a callback function to handle new blocks.

		// Listen for notifications.
		electrumClient.on('notification', handleNotifications);

		// Set up a subscription for new block headers.
		await electrumClient.subscribe('blockchain.headers.subscribe');
	});

	onDestroy(async () => {
		await wallet!.provider.disconnect();
		await electrumClient.disconnect();
	});
</script>

<section>
	<div class="status">
		<BitauthLink template={CatDex.template} />
		{#if connectionStatus == 'CONNECTED'}
			<img src={CONNECTED} alt={connectionStatus} />
		{:else}
			<img src={DISCONNECTED} alt="Disconnected" />
		{/if}
	</div>

	<h1>Trade CashTokens</h1>
	{#if connectionStatus == 'CONNECTED'}
		<div>
			<!-- Rounded switch -->
			<label class="switch">
				<input type="checkbox" bind:checked={showSettings} />
				<span class="slider round"></span>
			</label>

			{#if showSettings}
				{#if authBatons.length == 0}
					<button onclick={() => newAuthBaton()}>Create a Market Maker Authentication Baton</button>
				{:else if balance < 10000 && walletUnspent.length == 0}
					<a href="/wallet">Deposit funds</a> to create a market
				{:else}
					{#each authBatons as authBaton}
						<Utxo {...authBaton}></Utxo>
					{/each}
				{/if}
			{/if}
		</div>

		<b>Select an asset:</b>
		<select bind:value={selectedAsset} onchange={() => updateAsset()}>
			{#each bcmr.keys() as token}
				<option value={token}>
					{bcmr.get(token).name}
				</option>
			{/each}
		</select>
		<br />
		{#if selectedAsset}
			<img height="50" src={bcmr.get(selectedAsset).uris.icon} />
			{(
				assetBalance / BigInt(Math.pow(10, bcmr.get(selectedAsset).token.decimals))
			).toLocaleString()}
			<b>{bcmr.get(selectedAsset).token.symbol}</b>
		{/if}

		<div class="swap">
			amount to swap:
			<label>
				<input type="number" bind:value={amount} min="0" max="10" onchange={() => updateSwap()} />
			</label>
		</div>

		<br />

		{#if transaction}
			<Transaction {transaction} {sourceOutputs} category={selectedAsset} />
		{/if}
		{transactionError}

		{stringify(markets)}

		<!-- {#if selectedAsset}
			<Chat bind:topic={selectedAsset}></Chat>
		{/if} -->
	{:else}
		<div class="swap">
			<p>Not connected.</p>
		</div>
	{/if}

	<Readme />
</section>

<style>
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

	.status {
		text-align: end;
	}

	.auth {
		align-content: center;
		padding: 10px;
	}
	.auth img {
		border-radius: 20%;
	}

	button {
		background-color: #a45eb6; /* Green */
		border: none;
		color: white;
		padding: 10px;
		border-radius: 20px;
		text-align: center;
		text-decoration: none;
		display: inline-block;
		font-size: 16px;
	}

	.switch {
		position: relative;
		display: inline-block;
		width: 60px;
		height: 34px;
	}

	/* Hide default HTML checkbox */
	.switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	/* The slider */
	.slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #ccc;
		-webkit-transition: 0.4s;
		transition: 0.4s;
	}

	.slider:before {
		position: absolute;
		content: '';
		height: 26px;
		width: 26px;
		left: 4px;
		bottom: 4px;
		background-color: white;
		-webkit-transition: 0.4s;
		transition: 0.4s;
	}

	input:checked + .slider {
		background-color: #a45eb6;
	}

	input:focus + .slider {
		box-shadow: 0 0 1px #a45eb6;
	}

	input:checked + .slider:before {
		-webkit-transform: translateX(26px);
		-ms-transform: translateX(26px);
		transform: translateX(26px);
	}

	/* Rounded sliders */
	.slider.round {
		border-radius: 34px;
	}

	.slider.round:before {
		border-radius: 50%;
	}
</style>
