<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/state';

	import { binToHex, cashAddressToLockingBytecode, encodeTransactionBCH } from '@bitauth/libauth';

	import { ElectrumClient, ConnectionStatus } from '@electrum-cash/network';

	import { IndexedDBProvider } from '@mainnet-cash/indexeddb-storage';
	import { BaseWallet, Wallet, TestNetWallet, hexToBin } from 'mainnet-js';
	import { getScriptHash, getHdPrivateKey, type UtxoI, getAllTransactions } from '@unspent/tau';

	import { Channel, buildChannel } from '@fbch/lib';

	import BitauthLink from '$lib/BitauthLink.svelte';
	import ChatPost from '$lib/ChatPost.svelte';
	import CONNECTED from '$lib/images/connected.svg';
	import DISCONNECTED from '$lib/images/disconnected.svg';

	const isMainnet = page.url.hostname == 'vox.cash';
	const prefix = isMainnet ? 'bitcoincash' : 'bchtest';
	const server = isMainnet ? 'bch.imaginary.cash' : 'chipnet.bch.ninja';
	const explorer = isMainnet
		? 'https://bch.loping.net/address/'
		: 'https://cbch.loping.net/address/';

	let now = 0;
	let connectionStatus = $state('');
	let contractState = $state('');

	let { topic, transactions } = $props();
	let message = $state('');

	let address = $derived(Channel.getAddress(topic, prefix));
	const scripthash = $derived(Channel.getScriptHash(topic));

	let posts: any[] = $state([]);
	let key = '';
	let electrumClient: any;
	let walletScriptHash = '';

	let wallet: any;

	const handleNotifications = function (data: any) {
		if (data.method === 'blockchain.headers.subscribe') {
			let d = data.params[0];
			now = d.height;
		} else if (data.method === 'blockchain.scripthash.subscribe') {
			if (data.params[1] !== contractState) {
				contractState = data.params[1];
				connectionStatus = ConnectionStatus[electrumClient.status];
				updateContract();
				//updateWallet();
			}
		} else {
			console.log(data);
		}
	};

	const updateContract = async function () {
		if (now == 0) {
			let tip = await electrumClient.request('blockchain.headers.get_tip');
			now = tip.height;
		}
		let historyResponse = await electrumClient.request(
			'blockchain.scripthash.get_history',
			scripthash,
			now - 1500,
			-1
		);
		if (historyResponse instanceof Error) throw historyResponse;

		let tx_hashes = historyResponse.map((r) => r.tx_hash);
		let transactions = await getAllTransactions(electrumClient, tx_hashes);
		posts = buildChannel(historyResponse, transactions, topic);
	};

	onMount(async () => {
		const isMainnet = page.url.hostname !== 'vox.cash';
		BaseWallet.StorageProvider = IndexedDBProvider;
		wallet = isMainnet ? await TestNetWallet.named(`vox`) : await Wallet.named(`vox`);
		key = getHdPrivateKey(wallet.mnemonic!, wallet.derivationPath.slice(0, -2), wallet.isTestnet);
		let bytecodeResult = cashAddressToLockingBytecode(wallet.getDepositAddress());
		if (typeof bytecodeResult == 'string') throw bytecodeResult;
		walletScriptHash = getScriptHash(bytecodeResult.bytecode);

		// Initialize an electrum client.
		electrumClient = new ElectrumClient(Channel.USER_AGENT, '1.4.1', server);

		// Wait for the client to connect.
		await electrumClient.connect();
		// Set up a callback function to handle new blocks.

		// Listen for notifications.
		electrumClient.on('notification', handleNotifications);
		connectionStatus = ConnectionStatus[electrumClient.status];
		// Set up a subscription for new block headers.
		await electrumClient.subscribe('blockchain.scripthash.subscribe', scripthash);
		updateContract();
		//updateWallet();
	});

	onDestroy(async () => {
		const electrumClient = new ElectrumClient(Channel.USER_AGENT, '1.4.1', server);
		await electrumClient.disconnect();
	});
</script>

<div class="box">
	<div class="row header">
        <a href="{explorer}{address}"> explorer</a>
		<div style="flex: 2 2 auto;"></div>
        <b><a href="/pop/">/pop</a>/{topic}</b>
        <div style="flex: 2 2 auto;"></div>
		{#if connectionStatus == 'CONNECTED'}
			<img src={CONNECTED} alt={connectionStatus} />
		{:else}
			<img src={DISCONNECTED} alt="Disconnected" />
		{/if}
		<BitauthLink template={Channel.template} />
	</div>
	<div class="row content">
		{#await transactions then build}
			{#each posts as post}
				<ChatPost {...post} />
			{/each}
		{:catch error}
			<p style="color: red">{error.message}</p>
		{/await}
	</div>
	<div class="row footer" bind:innerHTML={message} contenteditable></div>
</div>

<style>
	.box {
		display: flex;
		flex: 1 1 auto;
		flex-flow: column;
		height: 100%;
		border-radius: 10px;
		border: 1px solid rgba(78, 11, 92, 0.452);
		background-color: #ffffff33;
	}

	.box .row {
		border: 1px dotted grey;
	}

	.box .row.header {
        padding: 3px;
        display: flex;
		color: #ff00ff77;
		font-weight: 800;
		text-align: center;
		flex: 0 1 auto;
		/* The above is shorthand for:
        flex-grow: 0,
        flex-shrink: 1,
        flex-basis: auto
        */
	}

	.box .row.content {
		flex: 1 1 auto;
	}

	.box .row.footer {
		background: #fff;
		flex: 0 1 auto;
		height: auto;
		resize: none;
		padding: 10px;
	}
</style>
