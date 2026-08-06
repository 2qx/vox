<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/state';

	import {
		binToHex,
		cashAddressToLockingBytecode,
		encodeTransactionBch,
		hash256,
		hexToBin,
		sha256,
		swapEndianness,

		utf8ToBin

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
		type UtxoI,
		sleep
	} from '@unspent/tau';

	import { IndexedDBProvider } from '@mainnet-cash/indexeddb-storage';
	import { BaseWallet, Wallet, TestNetWallet } from '@unspent/wallet';

	import BCH from '$lib/images/BCH.svg';
	import tBCH from '$lib/images/tBCH.svg';
	import tPHOTON from '$lib/images/tPHOTON.svg';
	import PHOTON from '$lib/images/PHOTON.svg';

	let worker: Worker;
	let result;
	let workerStatus = $state('STATUS_IDLE');
	let workerMessage;

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

	let hashRate = $state(0);
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

	const halt = async function () {
		workerStatus = 'STATUS_HALTED';
		worker.terminate();
		await sleep(100);
		await initWebWorker();
		await sleep(100);
	};

	const mine = async function () {
		let template = Photon.generateTemplate(
			now,
			baton,
			minerThrowawayKey,
			wallet.getTokenDepositAddress(),
			CATEGORY
		);
		if (window.Worker) {
			worker.postMessage({ task: 'START', template: template, key: minerThrowawayKey });
		} else {
			console.log('Start mining called before worker init.');
		}
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
		let bcmr_data  = [
			'OP_RETURN', 
			'BCMR',
			sha256.hash(utf8ToBin('vox.cash/.well-known/bitcoin-cash-metadata-registry.json')),
			'vox.cash/.well-known/bitcoin-cash-metadata-registry.json'
		];
		wallet.tokenGenesis({
			cashaddr: Photon.getAddress(prefix), // token UTXO recipient, if not specified will default to sender's address
			amount: BigInt(21e14), // fungible token amount
			value: 50000000n, // Satoshi value
			nft: {
				capability: 'mutable',   
				commitment: '00000000fffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000'
			},
			bcmr_data
		});
		
		// 
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
			if (workerStatus == 'STATUS_MINING') {
				await halt();
				await mine();
			}
		}
		unspent = response;
		sumVault = sumUtxoValue(response, true);
		sumVaultTokens = sumTokenAmounts(response, CATEGORY);
	};

	async function initWebWorker() {
		// This function initiates the web worker
		// Check if we are in a browser
		if (window.Worker) {
			// Check if the browser supports web worker
			// We reset some values we use to visualise the progress
			workerStatus = 'STATUS_IDLE';
			result = undefined;
			// This is where we load the worker
			const MineWorker = await import('$workers/photon.js?worker');
			// And initiate the worker
			worker = new MineWorker.default();

			// The following part is called when the worker sends a message
			worker.onmessage = function (e: any) {
				// Let’s first get the status and the message from the event’s data
				const { status, message } = e.data;
				// We use these two variables on the website
				if (message) {
					workerMessage = message;
				}
				if (status) {
					workerStatus = status;
				}
				// This checks what the status of the message is
				switch (status) {
					case 'STATUS_BROADCAST':
						// Save the result returned from the web worker
						result = e.data.result;
						hashRate = e.data.hashRate;
						try {
							broadcast(result);
						} catch (e) {
							console.error(e);
						}
						// wait for the transaction to propogate.
						baton = Photon.getNextBatonUtxo(result);
						mine();
						break;
					case 'STATUS_MINING':
						//hashRate = e.data.hashRate;
						break;
					case 'STATUS_PROCESSING':
						// Save the current step number and total number of steps
						// step = e.data.step ?? 0; // Set to 0 instead of undefined if something went wrong
						// total = e.data.total ?? 0;
						break;
				}
			};
		} else {
			console.error('no worker');
		}
	}

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
		initWebWorker();
	});

	onDestroy(async () => {
		worker.terminate();
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

	<h1>Capture Photons</h1>
	<div class="swap">
		<div>
			<img width="50" src={icon} alt={ticker} />
			<br />
			{(sumWalletTokens / 100_000_000n).toLocaleString(undefined, { maximumFractionDigits: 5 })}
			{ticker}
		</div>
	</div>

	<div class="mining">
		{#if baton}
			<button class="button" disabled={workerStatus == 'STATUS_MINING'} onclick={() => mine()}
				>go
			</button>
			<button disabled={workerStatus == 'STATUS_IDLE'} class="button" onclick={() => halt()}
				>stop
			</button>
		{/if}
		{#if hashRate > 0}
			<p>{hashRate} Hash/s</p>
		{/if}
		<p>{workerStatus}</p>
	</div>

	{#if baton && baton.value > 0}
		<h3>Vault Status</h3>

		<div class="swap">
			<div>
				<img width="50" src={icon} alt={ticker} />
				<br />
				{(sumVaultTokens / 100_000_000n).toLocaleString()}
				{ticker}<br />
				{(sumVault / 100_000_000).toLocaleString()}
				{baseTicker}
				<img width="18px" src={bchIcon} alt={baseTicker} />
			</div>
		</div>
		<h4>Current Difficulty</h4>
		<p>Current Target</p>
		<pre>{binToHex(Photon.getNextTarget(baton, now))}</pre>
		<p>Previous Target</p>
		<pre>{swapEndianness(target)}</pre>
		Height: {baton.height} <br />
		Next Payout: {(
			Number(BigInt(baton.token_data?.amount!) / 420000n) / 100_000_000
		).toLocaleString(undefined, { maximumFractionDigits: 5 })}
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

	.button:hover {
		background-color: #a991af;
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
