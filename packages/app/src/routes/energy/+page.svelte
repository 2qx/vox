<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/state';

	import {
		binToHex,
		cashAddressToLockingBytecode,
		encodeTransactionBch,
		hexToBin,
		swapEndianness
	} from '@bitauth/libauth';

	import Photon, { PHOTON_CATEGORY, tPHOTON_CATEGORY } from '@unspent/photon';
	import { ElectrumClient, ConnectionStatus } from '@electrum-cash/network';

	import Readme from './README.md';
	import BitauthLink from '$lib/BitauthLink.svelte';
	import CONNECTED from '$lib/images/connected.svg';
	import DISCONNECTED from '$lib/images/disconnected.svg';
	import {
		binToBigIntUint256LE,
		getHdPrivateKey,
		getScriptHash,
		sumUtxoValue,
		sumTokenAmounts,
		type UtxoI
	} from '@unspent/tau';

	import { IndexedDBProvider } from '@mainnet-cash/indexeddb-storage';
	import { BaseWallet, Wallet, TestNetWallet } from '@unspent/wallet';

	import BCH from '$lib/images/BCH.svg';
	import tBCH from '$lib/images/tBCH.svg';
	import tPHOTON from '$lib/images/tPHOTON.svg';
	import PHOTON from '$lib/images/PHOTON.svg';

	let now = $state(0);
	let baton: UtxoI = $state();
	let contractState = '';
	let target: string = $state();
	let walletScriptHash = $state('');
	let wallet: any;
	let miner: any;
	let walletUnspent: any[] = $state([]);
	let unspent: any[] = $state([]);
	let minerThrowawayKey = $state('');

	let balance = $state(0);
	let sumWalletTokens = $state(0n);
	let sumWallet = $state(0);
	let sumVaultTokens = $state(0n);
	let sumVault = $state(0);

	let connectionStatus = $state('');
	let electrumClient: any;
	let scripthash = '';
	scripthash = Photon.getScriptHash();
	const isMainnet = page.url.hostname == 'vox.cash';
	let server = isMainnet ? 'bch.imaginary.cash' : 'chipnet.bch.ninja';
	const icon = isMainnet ? PHOTON : tPHOTON;
	const CATEGORY = isMainnet ? binToHex(PHOTON_CATEGORY) : binToHex(tPHOTON_CATEGORY);
	const baseTicker = isMainnet ? 'BCH' : 'tBCH';
	const ticker = isMainnet ? 'PHOTON' : 'tPHOTON';
	const prefix = isMainnet ? 'bitcoincash' : 'bchtest';
	const bchIcon = isMainnet ? BCH : tBCH;
	const fee = isMainnet ? 1 : 50;

	const handleNotifications = function (data: any) {
		if (data.method === 'blockchain.headers.subscribe') {
			let d = data.params[0];
			now = d.height;
		} else if (data.method === 'blockchain.scripthash.subscribe') {
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

	const mine = async function () {
		let unlockResponse = Photon.slowMine(
			now,
			unspent[0],
			minerThrowawayKey,
			wallet.getTokenDepositAddress(),
			CATEGORY,
			fee,
			5000
		);
		let raw_tx = binToHex(encodeTransactionBch(unlockResponse.transaction));
		console.log(raw_tx);
		await broadcast(raw_tx);
	};

	const broadcast = async function (raw_tx: string) {
		let response = await electrumClient.request('blockchain.transaction.broadcast', raw_tx);
		if (response instanceof Error) {
			connectionStatus = ConnectionStatus[electrumClient.status];
			throw response;
		}
		response as any[];
	};

	const fundVault = async function () {
		wallet.tokenGenesis({
			cashaddr: Photon.getAddress(prefix), // token UTXO recipient, if not specified will default to sender's address
			amount: BigInt(21e14), // fungible token amount
			value: 50000000n, // Satoshi value
			nft: {
				capability: 'mutable',
				commitment: '00000000' + '000000000000000000000000000000000000000000000000000000000000ff78'
			}
		});
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
		sumWalletTokens = sumTokenAmounts(walletUnspent, CATEGORY);

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
		response = response.filter((u: UtxoI) => u.token_data?.category == CATEGORY);
		if (response.length == 1) {
			baton = response[0] as UtxoI;
			target = swapEndianness(baton.token_data?.nft?.commitment.slice(8, 72)!);
		}
		unspent = response;
		sumVault = sumUtxoValue(response, true);
		sumVaultTokens = sumTokenAmounts(response, CATEGORY);
	};

	onMount(async () => {
		BaseWallet.StorageProvider = IndexedDBProvider;
		wallet = isMainnet ? await Wallet.named(`vox`) : await TestNetWallet.named(`vox`);
		miner = isMainnet ? await Wallet.named(`miner`) : await TestNetWallet.named(`miner`);
		minerThrowawayKey = getHdPrivateKey(
			miner.mnemonic!,
			miner.derivationPath.slice(0, -2),
			miner.isTestnet
		);
		let lockingCodeResult = cashAddressToLockingBytecode(wallet.getDepositAddress());
		if (typeof lockingCodeResult == 'string') throw lockingCodeResult;
		walletScriptHash = getScriptHash(lockingCodeResult.bytecode);

		// Initialize an electrum client.
		electrumClient = new ElectrumClient(Photon.USER_AGENT, '1.4.1', server);

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
		await electrumClient.disconnect();
	});
</script>

<svelte:head>
	<title>γ Photons</title>
	<meta name="description" content="Emit Photons Tokens" />
</svelte:head>

<section>
	<div class="status">
		{now.toLocaleString()}<sub>■</sub>
		<BitauthLink template={Photon.template} />
		{#if connectionStatus == 'CONNECTED'}
			<img src={CONNECTED} alt={connectionStatus} />
		{:else}
			<img src={DISCONNECTED} alt="Disconnected" />
		{/if}
	</div>

	<h1>Emit Photons</h1>
	<div class="swap">
		<div>
			<img width="50" src={icon} alt={ticker} />
			<br />
			{(sumWalletTokens/ 100_000_000n	).toLocaleString(undefined,{maximumFractionDigits:5})}
			{ticker}
		</div>
	</div>

	<div class="mining">
		{#if baton}
			<button class="button" onclick={() => mine()}>mine {ticker}</button>
		{/if}
	</div>

	{#if baton && baton.value > 0}
		<h3>Vault Status</h3>

		<div class="swap">
			<div>
				<img width="50" src={icon} alt={ticker} />
				<br />
				{(sumVaultTokens / 100_000_000n).toLocaleString()}
				{ticker}<br />
				{(sumVault/100_000_000).toLocaleString()} {baseTicker}
				<img width="18px" src={bchIcon} alt={baseTicker} />
			</div>
		</div>
		<h4>Current Difficulty</h4>
		<p>Current Target</p>
		<pre>{binToHex(Photon.getNextTarget(baton, now))}</pre>
		<p>Previous Target</p>
		<pre>{swapEndianness(target)}</pre>
		Height: {baton.height} <br />
		Next Payout: {(Number(BigInt(baton.token_data?.amount!) / 420000n )/100_000_000).toLocaleString(undefined,{maximumFractionDigits:5})}
		{ticker}<br />
		Cash: {baton.value.toLocaleString()} sats {baseTicker}<br />

		<p>{ticker} category:</p>
		<pre>{baton.token_data?.category}</pre>
	{:else if !isMainnet}
		<button class="button" onclick={() => fundVault()}>Mint Genesis Tx (0.5 {baseTicker})</button>
	{:else}
		No tokens in vault
	{/if}

	<Readme />
</section>

<style>
	pre {
		font-size: x-small;
	}

	.status {
		text-align: end;
		color: #ffffff;
		font-weight: 600;
	}

	.mining {
		text-align: center;
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
</style>
