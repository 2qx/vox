<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/state';

	import { binToHex, cashAddressToLockingBytecode, encodeTransactionBCH } from '@bitauth/libauth';

	import BCH from '$lib/images/BCH.svg';
	import tBCH from '$lib/images/tBCH.svg';
	import tBPTS from '$lib/images/tBPTS.svg';
	import BPTS from '$lib/images/BPTS.svg';

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
	import { BPTS as bptCat, tBPTS as tbptCat } from '@unspent/blockpoint';

	import Readme from './README.md';
	import BitauthLink from '$lib/BitauthLink.svelte';
	import Transaction from '$lib/Transaction.svelte';
	import CONNECTED from '$lib/images/connected.svg';
	import DISCONNECTED from '$lib/images/disconnected.svg';

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

	let sumWalletBlockPoint = $state(0n);
	let sumWallet = $state(0);
	let sumVaultBlockPoint = $state(0n);
	let sumVault = $state(0);

	scripthash = BlockPoint.getScriptHash();

	const isMainnet = page.url.hostname == 'vox.cash';
	const icon = isMainnet ? BPTS : tBPTS;
	const category = isMainnet ? binToHex(bptCat) : binToHex(tbptCat);
	const baseTicker = isMainnet ? 'BCH' : 'tBCH';
	const ticker = isMainnet ? 'BPTS' : 'tBPTS';
	const prefix = isMainnet ? 'bitcoincash' : 'bchtest';
	const server = isMainnet ? 'bch.imaginary.cash' : 'chipnet.bch.ninja';
	const bchIcon = isMainnet ? BCH : tBCH;

	let spent = new Set();
	let timer: any = 0;
	let amount = 0;
	let wallet: any;
	let transactionError: string | boolean = $state('');

	const handleNotifications = async function (data: any) {
		if (data.method === 'blockchain.headers.subscribe') {
			let d = data.params[0];
			now = d.height;
		} else if (data.method === 'blockchain.scripthash.subscribe') {
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

	const debounceUpdateWallet = () => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			updateWallet();
			updateUnspent();
		}, 1500);
	};

	const updateWallet = async function () {
		let response = await electrumClient.request(
			'blockchain.scripthash.listunspent',
			walletScriptHash,
			'include_tokens'
		);
		if (response instanceof Error) throw response;

		walletUnspent = response;
		sumWallet = sumUtxoValue(walletUnspent, true);
		sumWalletBlockPoint = sumTokenAmounts(walletUnspent, category);

		walletUnspent = walletUnspent
			.filter((u: UtxoI) => !u.token_data)
			.filter((u: UtxoI) => u.height > 0);
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
		utxo: UtxoI,
		walletUtxo: UtxoI,
		key: string,
		category: any
	) {
		try {
			walletUnspent = walletUnspent.filter(
				(u) => `${u.tx_hash}:${u.tx_pos}` !== `${walletUtxo.tx_hash}:${walletUtxo.tx_pos}`
			);
			let result = BlockPoint.claim(now, utxo, walletUtxo, key, category);
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
		BaseWallet.StorageProvider = IndexedDBProvider;
		wallet = isMainnet ? await Wallet.named(`vox`) : await TestNetWallet.named(`vox`);

		key = getHdPrivateKey(wallet.mnemonic!, wallet.derivationPath.slice(0, -2), wallet.isTestnet);
		let lockingCodeResult = cashAddressToLockingBytecode(wallet.getDepositAddress());
		if (typeof lockingCodeResult == 'string') throw lockingCodeResult;
		walletScriptHash = getScriptHash(lockingCodeResult.bytecode);

		// Initialize an electrum client.
		electrumClient = new ElectrumClient(BlockPoint.USER_AGENT, '1.4.1', server);

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
		const electrumClient = new ElectrumClient(BlockPoint.USER_AGENT, '1.4.1', server);
		await electrumClient.disconnect();
	});
</script>


<svelte:head>
	<title>🟦 Block Points</title>
	<meta name="description" content="Claim rewards for coins held." />
</svelte:head>

<section>
	<div class="status">
		<BitauthLink template={BlockPoint.template} />
		{#if connectionStatus == 'CONNECTED'}
			<img src={CONNECTED} alt={connectionStatus} />
		{:else}
			<img src={DISCONNECTED} alt="Disconnected" />
		{/if}
	</div>
	<h1>Claim Block Point Rewards</h1>

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
				{sumWalletBlockPoint.toLocaleString()}
				{ticker}
			</div>
		</div>

		{transactionError}

		{#if walletUnspent.length > 0}
			<div class="swap">
				<button onclick={() => claimAll()}>Claim All Rewards</button>
			</div>
			<h4>Wallet Unspent Transaction Outputs (coins)</h4>
			<div class="grid">
				{#each walletUnspent as t, i}
					{#if !t.token_data && unspent[i]}
						<div class="row">
							{#if Math.floor(((now - t.height) * t.value) / 100000000) >= 1}
								<button
									class="action"
									onclick={() => claimReward(now, unspent[i], t, key, category)}
								>
									<img width="100" src={icon} alt="bptLogo" /><br />
									Claim {t.height > unspent[i].height
										? Math.floor(((now - t.height) * t.value) / 100000000)
										: Math.floor(((now - unspent[i].height) * t.value) / 100000000)}
									{ticker}
								</button>
							{:else}
								<button class="action" disabled>
									<img width="100" src={icon} alt="bptLogo" /><br />
									{t.height > unspent[i].height
										? (((now - t.height) * t.value) / 100000000).toLocaleString(undefined, {
												minimumFractionDigits: 4
											})
										: (((now - unspent[i].height) * t.value) / 100000000).toLocaleString(
												undefined,
												{
													minimumFractionDigits: 4
												}
											)}
									{ticker}
								</button>
							{/if}
						</div>
					{/if}
				{/each}
			</div>
		{:else }
			<div class="swap">
				<p><a href="/wallet">Deposit funds</a> to claim block points.</p>
			</div>
		{/if}
	{:else}
		<div class="swap">
			<p>Not connected.</p>
		</div>
	{/if}
	<Readme />
</section>

<style>
	
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
