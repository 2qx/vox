<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/state';

	import {
		binToHex,
		cashAddressToLockingBytecode,
		encodeTransactionBch,
		valueSatoshisToBin
	} from '@bitauth/libauth';

	// @ts-ignore
	import Readme from './README.md';

	import RangeSlider from '$lib/RangeSlider.svelte';
	import TokenIcon from '$lib/TokenIcon.svelte';
	import BCH from '$lib/images/BCH.svg';
	import tBCH from '$lib/images/tBCH.svg';
	import tBADGER from '$lib/images/tBADGER.svg';
	import BADGER from '$lib/images/BADGER.svg';

	import { ElectrumClient, ConnectionStatus } from '@electrum-cash/network';

	import { IndexedDBProvider } from '@mainnet-cash/indexeddb-storage';
	import { BaseWallet, Wallet, TestNetWallet } from 'mainnet-js';

	import {
		getDefaultElectrum,
		getScriptHash,
		getHdPrivateKey,
		sumUtxoValue,
		type UtxoI
	} from '@unspent/tau';

	import BadgerStake, { BADGER as badgerCat, tBADGER as tBadgerCat } from '@unspent/badgers';

	import BitauthLink from '$lib/BitauthLink.svelte';
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
	let authUtxo: any = $state('');
	let key = $state('');
	let electrumClient: any = $state();
	let scripthash = $state('');
	let vaultAddr = $state('');
	let walletScriptHash = $state('');

	let balance = $state(0);
	let stakeValue: number | undefined = $state();
	let stakeBlock = $state(1);

	const isMainnet = page.url.hostname == 'vox.cash';
	const icon = isMainnet ? BADGER : tBADGER;
	const category = isMainnet ? binToHex(badgerCat) : binToHex(tBadgerCat);
	const baseTicker = isMainnet ? 'BCH' : 'tBCH';
	const ticker = isMainnet ? 'BADGER' : 'tBADGER';
	const prefix = isMainnet ? 'bitcoincash' : 'bchtest';
	const server = getDefaultElectrum(isMainnet);
	const bchIcon = isMainnet ? BCH : tBCH;

	scripthash = BadgerStake.getScriptHash(category);
	vaultAddr = BadgerStake.getAddress(category, prefix);

	let spent = new Set();
	let timer: any = 0;
	let amount = 0;
	let wallet: any;
	let transactionError: string | boolean = '';
	let req = {};

	const handleNotifications = async function (data: any) {
		connectionStatus = ConnectionStatus[electrumClient.status];
		if (data.method === 'blockchain.headers.subscribe') {
			let d = data.params[0];
			now = d.height;

			updateUnspent();
		} else if (data.method === 'blockchain.scripthash.subscribe') {
			if (data.params[1] !== contractState) {
				contractState = data.params[1];
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
		walletUnspent = response;
		balance = sumUtxoValue(walletUnspent, true);
	};

	const broadcast = async function (raw_tx: string) {
		let response = await electrumClient.request('blockchain.transaction.broadcast', raw_tx);
		if (response instanceof Error) {
			connectionStatus = ConnectionStatus[electrumClient.status];
			throw response;
		}
		response as any[];
	};

	const updateUnspent = async function () {
		let response = await electrumClient.request(
			'blockchain.scripthash.listunspent',
			scripthash,
			'include_tokens'
		);
		if (response instanceof Error) throw response;

		unspent = response
			.filter((u: any) => u.token_data.nft.capability == 'mutable')
			.map((u: any) => {
				return {
					...u,
					...BadgerStake.parseNFT(u),
					...{ now: now }
				};
			});
		unspent.sort((a, b) => a.stake + a.height - (b.stake + b.height));

		authUtxo = response
			.filter((u: any) => u.token_data.nft.capability == 'minting')
			.map((u: any) => {
				return {
					...u,
					...BadgerStake.parseNFT(u),
					...{ now: now }
				};
			})[0];
	};

	const unlock = async function (utxo: UtxoI) {
		let unlockResponse = BadgerStake.unlock(utxo);
		let raw_tx = binToHex(encodeTransactionBch(unlockResponse.transaction));
		console.log(raw_tx);
		await broadcast(raw_tx);
	};

	const lock = async function () {
		if (stakeBlock < 32767) {
			if (stakeValue && stakeValue > 0.0005) {
				let lockResponse = BadgerStake.lock(
					authUtxo,
					Math.floor(stakeValue * 100_000_000),
					stakeBlock,
					walletUnspent,
					key
				);
				let raw_tx = binToHex(encodeTransactionBch(lockResponse.transaction));
				console.log(raw_tx);
				await broadcast(raw_tx);
			}
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
		electrumClient = new ElectrumClient(BadgerStake.USER_AGENT, '1.4.1', server);

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
		const electrumClient = new ElectrumClient(BadgerStake.USER_AGENT, '1.4.1', server);
		await electrumClient.disconnect();
	});
</script>



<svelte:head>
	<title>🦡 Badgers</title>
	<meta name="description" content="Stake coins for Badgers." />
</svelte:head>

<section>
	<div class="status">
		{now.toLocaleString()}
		<BitauthLink template={BadgerStake.template} />
		{#if connectionStatus == 'CONNECTED'}
			<img src={CONNECTED} alt={connectionStatus} />
		{:else}
			<img src={DISCONNECTED} alt="Disconnected" />
		{/if}
	</div>

	<h1>Stake Coins for Badgers</h1>

	<!-- <button onclick={() => { init(); }}> init </button> -->
	<div class="swap">
		<div>
			<img width="50" src={bchIcon} alt={baseTicker} />
			<br />
			{(balance / 100000000).toLocaleString()}
			{baseTicker}
		</div>
	</div>


	{#if balance > 0}
		<div class="stakeForm">
			<div>
				{#if stakeValue > 0 && stakeValue < 0.00005}
					<span style="font-size:large; color: red;">Min stake is 0.00005 BCH!</span>
				{:else if stakeValue > 0 && stakeBlock > 0}
					<h3>
						Earn {Math.floor(stakeValue * stakeBlock).toLocaleString()}
						{ticker}
						<TokenIcon {category} size={16} {isMainnet}></TokenIcon>
					</h3>
				{:else}
					<h3>Adjust controls to stake {ticker}</h3>
				{/if}
			</div>
			<div class="purple-theme">
				<label for="stakeValue">BCH to Lock</label>
				<RangeSlider
					bind:value={stakeValue}
					id="stakeValue"
					float={true}
					min={0}
					step={0.01}
					max={balance / 100000000}
				/>
				{stakeValue}
				{baseTicker}
			</div>
			<div class="purple-theme">
				<label for="stakeBlock"># Blocks</label>
				<RangeSlider bind:value={stakeBlock} id="stakeBlock" float={true} min={1} max={32767} />
				{#if stakeBlock > 32767}
					<span style="font-size:large; color: red;">Max duration is 32,767 blocks!</span>
				{:else if stakeBlock < 1}
					<span style="font-size:large; color: red;">Min duration is one block</span>
				{:else if stakeBlock > 0}
					= {Number(stakeBlock / 144).toLocaleString(undefined, {
						minimumFractionDigits: 0,
						maximumFractionDigits: 3
					})} days
				{/if}
			</div>
			<div class="stake">
				{#if stakeValue * stakeBlock >= 1}
					<button
						onclick={() => {
							lock();
						}}
					>
						stake
					</button>
				{:else}
					<button disabled> stake </button>
					<br />
					<span style="font-size:large; color: red;"></span>
				{/if}
			</div>
		</div>
	{:else}
		<div class="stakeForm">
			<p><a href="/wallet" >Deposit funds</a> to stake coins.</p>
		</div>
	{/if}
	{#if unspent.length}
		<h3>Current Stakes</h3>
		<div class="grid">
			{#if unspent.length > 0}
				{#each unspent as item, index}
					<div class="row">
						<BadgerStakeButton {unlock} {...item} />
					</div>
				{/each}
			{:else}
				<p>No staked coins?</p>
				{vaultAddr}
			{/if}
		</div>
	{/if}

	<Readme />
</section>

<style>
	section {
		padding: 5px;
	}
	.swap {
		display: flex;
	}
	.status {
		text-align: end;
		color: #ffffff;
		font-weight: 600;
	}

	.stakeForm {
		text-align: end;
	}
	.stakeForm div {
		margin: 2em;
	}
	.swap {
		display: flex;
		margin: auto;
		align-items: center;
		justify-content: center;
	}
	.swap div {
		padding: 10px;
		justify-content: center;
		text-align: center;
	}

	
	.grid {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		align-items: flex-end;
	}


	.grid .row {
		flex: 1 1 160px;
		justify-content: center;
		align-items: center;
		text-align: right;
		grid-gap: 0.1rem;
		margin: 0 0 3px 0;
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

	button:disabled {
		background-color: rgb(202, 191, 204);
		color: white;
	}
	button:hover {
		background-color: #9933b3;
	}

	

	label {
		margin: 8px;
		font-size: 16px;
		font-weight: 600;
	}
</style>
