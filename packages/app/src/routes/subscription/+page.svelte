<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/state';
	import Readme from './README.md';

	import BCH from '$lib/images/BCH.svg';
	import tBCH from '$lib/images/tBCH.svg';

	import { BPTS as bptCat, tBPTS as tbptCat } from '@unspent/blockpoint';

	import BitauthLink from '$lib/BitauthLink.svelte';
	import CONNECTED from '$lib/images/connected.svg';
	import DISCONNECTED from '$lib/images/disconnected.svg';

	import Subscription from '@unspent/subscription';

	import { binToHex, cashAddressToLockingBytecode } from '@bitauth/libauth';

	import { ElectrumClient, ConnectionStatus } from '@electrum-cash/network';

	import {
		sumUtxoValue,
		sumTokenAmounts,
		getScriptHash,
		getHdPrivateKey,
		type UtxoI
	} from '@unspent/tau';

	import { IndexedDBProvider } from '@mainnet-cash/indexeddb-storage';
	import { BaseWallet, Wallet, TestNetWallet, hexToBin } from 'mainnet-js';

	const isMainnet = page.url.hostname == 'vox.cash';
	const category = isMainnet ? binToHex(bptCat) : binToHex(tbptCat);
	const baseTicker = isMainnet ? 'BCH' : 'tBCH';
	const prefix = isMainnet ? 'bitcoincash' : 'bchtest';
	const server = isMainnet ? 'bch.imaginary.cash' : 'chipnet.bch.ninja';
	const bchIcon = isMainnet ? BCH : tBCH;

	let now = $state(0);
	let connectionStatus = $state('');
	let contractState = $state('');
	let sumWallet = $state(0);

	let spent = new Set();
	let timer: any = 0;
	let amount = 0;
	let wallet: any;
	let transactionError: string | boolean = $state('');

	let unspent: any[] = $state([]);
	let walletUnspent: any[] = $state([]);

	let key = $state('');
	let electrumClient: any = $state();
	let scripthash = $state('');
	let walletScriptHash = $state('');

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
		let unspentIds = new Set(response.map((utxo: any) => `${utxo.tx_hash}":"${utxo.tx_pos}`));
		if (unspent.length == 0 || spent.intersection(unspentIds).size == 0) {
			unspent = response;
		}
		unspent = unspent.filter((t) => t.height > 0);
		//unspent = unspent.filter((t) => t.token_data && t.token_data.category == category);
		unspent.sort((a, b) => a.height - b.height);
	};

	onMount(async () => {
		BaseWallet.StorageProvider = IndexedDBProvider;
		wallet = isMainnet ? await Wallet.named(`vox`) : await TestNetWallet.named(`vox`);

		key = getHdPrivateKey(wallet.mnemonic!, wallet.derivationPath.slice(0, -2), wallet.isTestnet);
		let lockingCodeResult = cashAddressToLockingBytecode(wallet.getDepositAddress());
		if (typeof lockingCodeResult == 'string') throw lockingCodeResult;
		walletScriptHash = getScriptHash(lockingCodeResult.bytecode);

		let data  = {
			installment: 100n,
			period: 0,
			recipient: lockingCodeResult.bytecode,
			auth: Uint8Array.from([])
		}
	    
		
		Subscription.getAddress(data)

		// Initialize an electrum client.
		electrumClient = new ElectrumClient(Subscription.USER_AGENT, '1.4.1', server);

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
		const electrumClient = new ElectrumClient(Subscription.USER_AGENT, '1.4.1', server);
		await electrumClient.disconnect();
	});
</script>

<section>
	<div class="status">
		<BitauthLink template={Subscription.template} />
		{#if connectionStatus == 'CONNECTED'}
			<img src={CONNECTED} alt={connectionStatus} />
		{:else}
			<img src={DISCONNECTED} alt="Disconnected" />
		{/if}
	</div>

	
	<Readme />
</section>

<style>
	.status {
		text-align: end;
	}
</style>
