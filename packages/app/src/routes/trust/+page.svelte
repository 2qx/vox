<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/state';

	import { binToHex, cashAddressToLockingBytecode, encodeTransactionBch } from '@bitauth/libauth';

	import { ElectrumClient, ConnectionStatus } from '@electrum-cash/network';

	import { IndexedDBProvider } from '@mainnet-cash/indexeddb-storage';
	import { BaseWallet, Wallet, TestNetWallet } from 'mainnet-js';

	import {
		cashAssemblyToHex,
		getScriptHash,
		getHdPrivateKey,
		sumUtxoValue,
		sumTokenAmounts,
		type UtxoI,
		sleep
	} from '@unspent/tau';

	import BCH from '$lib/images/BCH.svg';
	import tBCH from '$lib/images/tBCH.svg';
	import unspentIcon from '$lib/images/unspent.svg'

	import Readme from './README.md';

	import BitauthLink from '$lib/BitauthLink.svelte';
	import CONNECTED from '$lib/images/connected.svg';
	import DISCONNECTED from '$lib/images/disconnected.svg';

	import Trust from '@unspent/trust';

	let electrumClient: any;
	let walletScriptHash = $state('');
	let now: number = $state(0);
	let connectionStatus = $state('');
	let contractState = $state('');

	let key = $state('');
	let amount = $state(0);
	let wallet: any;
	let transactionError: string | boolean = $state('');
	let scripthash = $state('');

	let timer: any = 0;

	let sumWalletBlockPoint = $state(0n);
	let sumWallet = $state(0);
	let sumVaultBlockPoint = $state(0n);
	let sumVault = $state(0);

	let unspent: any[] = $state([]);
	let walletUnspent: any[] = $state([]);

	const isMainnet = page.url.hostname == 'vox.cash';
	const server = isMainnet ? 'bch.imaginary.cash' : 'chipnet.bch.ninja';
	const baseTicker = isMainnet ? 'BCH' : 'tBCH';
	const ticker = isMainnet ? 'BPTS' : 'tBPTS';
	const bchIcon = isMainnet ? BCH : tBCH;

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
		// let unspentIds = new Set(response.map((utxo: any) => `${utxo.tx_hash}":"${utxo.tx_pos}`));
		// if (unspent.length == 0 || spent.intersection(unspentIds).size == 0) {
		// 	unspent = response;
		// }
		unspent = unspent.filter((t) => t.height > 0);
		unspent.sort((a, b) => a.height - b.height);
		sumVault = sumUtxoValue(unspent, true);
	};

	const step = async function () {};

	onMount(async () => {
		BaseWallet.StorageProvider = IndexedDBProvider;
		wallet = isMainnet ? await Wallet.named(`vox`) : await TestNetWallet.named(`vox`);

		key = getHdPrivateKey(wallet.mnemonic!, wallet.derivationPath.slice(0, -2), wallet.isTestnet);
		let lockingCodeResult = cashAddressToLockingBytecode(wallet.getDepositAddress());
		if (typeof lockingCodeResult == 'string') throw lockingCodeResult;
		walletScriptHash = getScriptHash(lockingCodeResult.bytecode);
		let record = Trust.asRecord(lockingCodeResult.bytecode);
		scripthash = Trust.getScriptHash(record);

		// Initialize an electrum client.
		electrumClient = new ElectrumClient(Trust.USER_AGENT, '1.4.1', server);

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
		const electrumClient = new ElectrumClient(Trust.USER_AGENT, '1.4.1', server);
		await electrumClient.disconnect();
	});
</script>

<section>
	<div class="status">
		<BitauthLink template={Trust.template} />
		{#if connectionStatus == 'CONNECTED'}
			<img src={CONNECTED} alt={connectionStatus} />
		{:else}
			<img src={DISCONNECTED} alt="Disconnected" />
		{/if}
	</div>
	{#if connectionStatus == 'CONNECTED'}
		<div class="swap">
			<div>
				<img width="50" src={bchIcon} alt={baseTicker} />
				<br />
				{sumWallet.toLocaleString()} sats {baseTicker}
			</div>
			<div>
				<img width="50" src={unspentIcon} alt="Trust vault" />
				<br />
				{sumVault.toLocaleString()}
			</div>
		</div>

		{transactionError}

		{#if unspent.length > 0}
			<h4>Trust Unspent Transaction Outputs (coins)</h4>
			<div class="grid">
				{#each unspent as t, i}
					{#if !t.token_data && unspent[i]}
						<div class="row">
							{#if Math.floor(((now - t.height) * t.value) / 100000000) >= 1}
								<button class="action" onclick={() => step(now, unspent[i], t, key)}> </button>
							{/if}
						</div>
					{/if}
				{/each}
			</div>
		{:else}
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
</style>
