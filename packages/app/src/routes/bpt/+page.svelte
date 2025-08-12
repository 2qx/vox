<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/state';

	import { binToHex, cashAddressToLockingBytecode, encodeTransactionBCH } from '@bitauth/libauth';

	import bch from '$lib/images/BCH.svg';
	import tBPT from '$lib/images/tBPT.svg';
	import BPT from '$lib/images/BPT.svg';

	import { ElectrumClient, ConnectionStatus } from '@electrum-cash/network';

	import { IndexedDBProvider } from '@mainnet-cash/indexeddb-storage';
	import { BaseWallet, Wallet, TestNetWallet, hexToBin } from 'mainnet-js';

	import {
		sumUtxoValue,
		sumTokenAmounts,
		getScriptHash,
		getHdPrivateKey,
		type UtxoI
	} from '@unspent/tau';
	import BlockPoint from '@unspent/blockpoint';
	import { BPT as bptCat, tBPT as tbptCat } from '@unspent/blockpoint';

	import Readme from './README.md';
	import BitauthLink from '$lib/BitauthLink.svelte';
	import Transaction from '$lib/Transaction.svelte';
	import CONNECTED from '$lib/images/connected.svg';
	import DISCONNECTED from '$lib/images/disconnected.svg';

	let now = 0;
	let connectionStatus = '';
	let contractState = '';

	let transaction_hex = '';
	let transaction: any = undefined;
	let transactionValid = false;
	let sourceOutputs: any = undefined;

	let unspent: any[] = [];
	let walletUnspent: any[] = [];
	let key = '';
	let electrumClient: any;
	let scripthash = '';
	let walletScriptHash = '';

	let sumWalletBlockPoint = 0n;
	let sumWallet = 0;
	let sumVaultBlockPoint = 0n;
	let sumVault = 0;

	scripthash = BlockPoint.getScriptHash();

	const isMainnet = page.url.hostname == 'vox.cash';
	let icon = isMainnet ? BPT : tBPT;
	let category = isMainnet ? binToHex(bptCat) : binToHex(tbptCat);
	let baseTicker = isMainnet ? 'BCH' : 'tBCH';
	let ticker = isMainnet ? 'BPT' : 'tBPT';
	let prefix = isMainnet ? 'bitcoincash' : 'bchtest';

	let server = isMainnet ? 'bch.imaginary.cash' : 'chipnet.bch.ninja';

	let spent = new Set();

	let amount = 0;
	let wallet: any;
	let transactionError: string | boolean = '';

	const handleNotifications = function (data: any) {
		if (data.method === 'blockchain.headers.subscribe') {
			let d = data.params[0];
			now = d.height;
		} else if (data.method === 'blockchain.scripthash.subscribe') {
			if (data.params[1] !== contractState) {
				contractState = data.params[1];
				connectionStatus = ConnectionStatus[electrumClient.status];
				amount = 0;
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

		sumWallet = sumUtxoValue(walletUnspent, true);
		sumWalletBlockPoint = sumTokenAmounts(walletUnspent, category);
		walletUnspent = walletUnspent.filter((t) => t.height > 0);
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
		unspent = unspent.filter((t) => t.height > 0);
		unspent = unspent.filter((t) => t.token_data && t.token_data.category == category);
		unspent.sort((a, b) => a.height - b.height);
		sumVault = sumUtxoValue(unspent, true);
		sumVaultBlockPoint = sumTokenAmounts(unspent, category);
	};

	const broadcast = async function (raw_tx: string) {
		let response = await electrumClient.request('blockchain.transaction.broadcast', raw_tx);
		if (response instanceof Error) {
			connectionStatus = ConnectionStatus[electrumClient.status];
			throw response;
		}
		response as any[];
	};

	const claimAll = function () {
		walletUnspent.map((walletUtxo, i) => {
			claimReward(now, unspent[i], walletUtxo, key, category);
		});
	};

	const claimReward = function (
		now: number,
		unspent: UtxoI,
		wallet: UtxoI,
		key: string,
		category: any
	) {
		try {
			let result = BlockPoint.claim(now, unspent, wallet, key, category);
			transaction = result.transaction;
			sourceOutputs = result.sourceOutputs;
			transaction_hex = binToHex(encodeTransactionBCH(transaction));
			broadcast(transaction_hex);
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
		const isMainnet = page.url.hostname !== 'vox.cash';
		BaseWallet.StorageProvider = IndexedDBProvider;
		wallet = isMainnet ? await TestNetWallet.named(`vox`) : await Wallet.named(`vox`);
		key = getHdPrivateKey(wallet.mnemonic!, wallet.derivationPath.slice(0, -2), wallet.isTestnet);
		let lockcodeResult = cashAddressToLockingBytecode(wallet.getDepositAddress());
		if (typeof lockcodeResult == 'string') throw lockcodeResult;
		walletScriptHash = getScriptHash(lockcodeResult.bytecode);

		// Initialize an electrum client.
		electrumClient = new ElectrumClient(BlockPoint.USER_AGENT, '1.4.1', server);

		// Wait for the client to connect.
		await electrumClient.connect();
		// Set up a callback function to handle new blocks.

		// Listen for notifications.
		electrumClient.on('notification', handleNotifications);

		// Set up a subscription for new block headers.
		await electrumClient.subscribe('blockchain.scripthash.subscribe', scripthash);
		await electrumClient.subscribe('blockchain.headers.subscribe');
		updateUnspent();
		updateWallet();
	});

	onDestroy(async () => {
		const electrumClient = new ElectrumClient(BlockPoint.USER_AGENT, '1.4.1', server);
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
		<BitauthLink template={BlockPoint.template} />
	</div>
	<h1>Claim Block Point Rewards</h1>

	<div class="swap">
		<div>
			<img width="50" src={bch} alt={baseTicker} />
			<br />
			{sumWallet.toLocaleString()} <b>{baseTicker}</b>
		</div>
		<div>
			<img width="50" src={icon} alt={ticker} />
			<br />
			{sumWalletBlockPoint.toLocaleString()} <b>{ticker}</b>
		</div>
	</div>

	<div class="swap">
		<button onclick={() => claimAll()}>Claim All Rewards</button>
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
	{/if}
	{#if transaction}
		<Transaction {transaction} {sourceOutputs} {category} />
	{/if}
	{transactionError}

	{#if walletUnspent.filter((u) => !u.token_data).filter((u) => u.height > 0).length > 0}
		<h4>Wallet Unspent Transaction Outputs (coins)</h4>
		<div class="grid">
			{#each walletUnspent as t, i}
				{#if !t.token_data && unspent[i]}
					<div class="row">
						{#if Math.floor(((now - t.height) * t.value) / 100000000) > 1}
							<button class="action" onclick={() => claimReward(now, unspent[i], t, key, category)}>
								<img width="100" src={icon} alt="bptLogo" /><br />
								Claim {t.height > unspent[i].height
									? Math.floor(((now - t.height) * t.value) / 100000000)
									: Math.floor(((now - unspent[i].height) * t.value) / 100000000)} BPT
							</button>
						{/if}
					</div>
				{/if}
			{/each}
		</div>
	{:else}
		<p>No confirmed coins to claim Block Points</p>
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
		background-color: rgba(200, 229, 238, 0.514);
		color: #000000;
		margin: 5px;
		padding: 10px;
		font-weight: 900;
		font-size: small;
	}

	.action:disabled {
		display: inline-block;
		border-radius: 10px;
		background-color: #80748069;
		color: #ffffff;
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
		justify-content: center;
		align-items: center;
		text-align: center;
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
