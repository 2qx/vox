<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/state';

	import Readme from './README.md';

	import BitauthLink from '$lib/BitauthLink.svelte';
	import CONNECTED from '$lib/images/connected.svg';
	import DISCONNECTED from '$lib/images/disconnected.svg';

	import TokenIcon from '$lib/TokenIcon.svelte';
	import TokenNftData from '$lib/TokenNftData.svelte';

	import SmallIndex from '@unspent/small';

	import { ElectrumClient, ConnectionStatus } from '@electrum-cash/network';
	import { BaseWallet, Wallet, TestNetWallet, NFTCapability, TokenMintRequest } from 'mainnet-js';

	import { IndexedDBProvider } from '@mainnet-cash/indexeddb-storage';

	import { 
		binToHex,
		cashAddressToLockingBytecode, 
		encodeTransactionBch, 
	 } from '@bitauth/libauth';

	import { getScriptHash, getHdPrivateKey, type UtxoI } from '@unspent/tau';

	import SmallRecord from '$lib/SmallRecord.svelte';

	let now: number = $state(0);
	let privatekey = $state('');
	let key = $state('');
	let connectionStatus = $state('');
	let electrumClient: any;
	let walletScriptHash = $state('');
	let wallet: any = $state();
	let transactionError = $state("");

	let unspent: UtxoI[] = $state([]);
	let batons: any[] = $state([]);
	let selected: UtxoI | undefined = $state();

	const isMainnet = page.url.hostname == 'vox.cash';
	const prefix = isMainnet ? 'bitcoincash' : 'bchtest';
	const server = isMainnet ? 'bch.imaginary.cash' : 'chipnet.bch.ninja';

	async function updateUnspent() {
		if (electrumClient && now > 1000) {
			unspent = await electrumClient.request(
				'blockchain.scripthash.listunspent',
				SmallIndex.getScriptHash(key),
				'include_tokens'
			) ;
		}
	}
	async function setAuth(auth: UtxoI) {
		selected = auth;
	}

	const clear = async function () {
		// mint 2 NFTs, amount reducing

		unspent = unspent.filter((u: any) => u.height + u.value < now)
		console.log(key)
		let tx = SmallIndex.drop(key, unspent)
		let transaction_hex = binToHex(encodeTransactionBch(tx.transaction));
		await broadcast(transaction_hex);
		
	};

	const handleNotifications = function (data: any) {
		connectionStatus = ConnectionStatus[electrumClient.status];
		if (data.method === 'blockchain.headers.subscribe') {
			let d = data.params[0];
			now = d.height;
			updateUnspent();
			updateWallet();
		} else if (data.method === 'blockchain.scripthash.subscribe') {
			// if (data.params[1] !== contractState) {
			// 	contractState = data.params[1];
			// 	amount = 0n;
			// 	debounceUpdateWallet();
			// }
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

		batons = response.filter(
			(u: UtxoI) =>
				u.token_data && u.token_data.nft && u.token_data.nft.capability == NFTCapability.minting
		);
	};

	const broadcast = async function (raw_tx: string) {
		let response = await electrumClient.request('blockchain.transaction.broadcast', raw_tx);
		if (response instanceof Error) {
			connectionStatus = ConnectionStatus[electrumClient.status];
			transactionError = response.message;
			throw response;
		}
		transactionError = response
		response as any[];
	};

	onMount(async () => {
		BaseWallet.StorageProvider = IndexedDBProvider;
		wallet = isMainnet ? await Wallet.named(`vox`) : await TestNetWallet.named(`vox`);

		privatekey = getHdPrivateKey(
			wallet.mnemonic!,
			wallet.derivationPath.slice(0, -2),
			wallet.isTestnet
		);
		let lockcodeResult = cashAddressToLockingBytecode(wallet.getDepositAddress());
		if (typeof lockcodeResult == 'string') throw lockcodeResult;
		walletScriptHash = getScriptHash(lockcodeResult.bytecode);

		// Initialize an electrum client.
		electrumClient = new ElectrumClient(SmallIndex.USER_AGENT, '1.4.1', server);

		// Wait for the client to connect.
		await electrumClient.connect();
		// Set up a callback function to handle new blocks.

		// Listen for notifications.
		electrumClient.on('notification', handleNotifications);

		// Set up a subscription for new block headers.
		await electrumClient.subscribe('blockchain.headers.subscribe');
	});
</script>

<section>
	<div class="status">
		<BitauthLink template={SmallIndex.template} />
		{#if connectionStatus == 'CONNECTED'}
			<img src={CONNECTED} alt={connectionStatus} />
		{:else}
			<img src={DISCONNECTED} alt="Disconnected" />
		{/if}
	</div>

	<label for="key">Key:</label>
	<input
		id="key"
		bind:value={key}
		onchange={() => updateUnspent()}
		placeholder="enter the index key"
	/>

	<br />
	<br />
	{#if unspent.length > 0}
		{#each unspent as record}
			<SmallRecord {...record} {now}  />
		{/each}
	{:else}
		No Records
	{/if}
	<br>
	<br>
	<button onclick={() => clear()}>Clear Expired</button>
	{transactionError}
	<Readme />
</section>

<style>
	.status {
		text-align: end;
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
</style>
