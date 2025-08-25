<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/state';
	import {
		binToHex,
		cashAddressToLockingBytecode,
		disassembleBytecodeBCH,
		encodeTransactionBCH,
		hexToBin
	} from '@bitauth/libauth';

	import { ElectrumClient, ConnectionStatus } from '@electrum-cash/network';

	import { IndexedDBProvider } from '@mainnet-cash/indexeddb-storage';
	import { BaseWallet, Wallet, TestNetWallet, NFTCapability, TokenSendRequest } from 'mainnet-js';
	import { blo } from 'blo';

	import {
		cashAssemblyToHex,
		getScriptHash,
		getHdPrivateKey,
		type UtxoI,
		getAllTransactions
	} from '@unspent/tau';

	import { Channel, Post, buildChannel, parseUsername } from '@fbch/lib';

	import trash from '$lib/images/trash.svg';
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

	const protocol_prefix = cashAssemblyToHex(`OP_RETURN <"U3V">`);

	let now = $state(0);
	let balance = $state(0);
	let connectionStatus = $state('');
	let contractState = $state('');

	let { topic, transactions } = $props();
	let message = $state('');
	let thisAuth = $state('');
	let sequence = $state(0);

	//let address = $derived(Channel.getAddress(topic, prefix));
	const scripthash = $derived(Channel.getScriptHash(topic));

	let posts: any[] = $state([]);

	let key = '';
	let electrumClient: any;
	let walletScriptHash = '';

	let wallet: any;
	let walletUnspent: any[] = $state([]);

	const handleNotifications = async function (data: any) {
		if (data.method === 'blockchain.headers.subscribe') {
			let d = data.params[0];
			now = d.height;
		} else if (data.method === 'blockchain.scripthash.subscribe') {
			if (data.params[1] !== contractState) {
				contractState = data.params[1];
				connectionStatus = ConnectionStatus[electrumClient.status];
				await updateContract();
				await updateWallet();
				updateScroll();
			}
		} else {
			console.log(data);
		}
	};

	const updateScroll = function () {
		let chat = document.getElementById('chat')!;
		var xH = chat.scrollHeight;
		chat.scrollTo(0, xH);
	};

	const updateWallet = async function () {
		let response = await electrumClient.request(
			'blockchain.scripthash.listunspent',
			walletScriptHash,
			'include_tokens'
		);
		if (response instanceof Error) throw response;

		walletUnspent = response.filter(
			(u: UtxoI) =>
				u.token_data && u.token_data.nft && u.token_data.nft.commitment.startsWith(protocol_prefix)
		);
		thisAuth = walletUnspent[0].token_data.category;
		balance = walletUnspent[0].value;
	};

	const updateContract = async function () {
		let response = await electrumClient.request(
			'blockchain.scripthash.listunspent',
			scripthash,
			'include_tokens'
		);

		if (response instanceof Error) throw response;

		let tx_hashes = Array.from(new Set(response.map((utxo: any) => utxo.tx_hash))) as string[];

		let historyResponse = await electrumClient.request(
			'blockchain.scripthash.get_history',
			scripthash,
			now - 1500,
			-1
		);

		let transactions = await getAllTransactions(electrumClient, tx_hashes);
		posts = buildChannel(historyResponse, transactions, topic);
		posts = posts.map((p) => {
			return {
				thisAuth: thisAuth == p.auth,
				...p
			};
		});

		if (posts.slice(-1).length > 0) {
			sequence = posts.slice(-1)[0].height <= 0 ? posts.slice(-1)[0].sequence + 1 : 0;
		} else {
			sequence = 0;
		}
	};

	const clearPost = async function (post: Post) {
		let response = await electrumClient.request(
			'blockchain.scripthash.listunspent',
			scripthash,
			'include_tokens'
		);
		if (response instanceof Error) throw response;

		let utxos = response.filter((u: UtxoI) => u.tx_hash == post.hash);
		let clearPostTx = Channel.clear(topic, utxos, walletUnspent[0], key, now);
		let raw_tx = binToHex(encodeTransactionBCH(clearPostTx.transaction));
		console.log(raw_tx);
		await broadcast(raw_tx);
	};

	const send = async function (msg: string) {
		let post = Channel.post(
			topic,
			msg,
			walletUnspent[0],
			(Math.round(now / 1000) + 10) * 10,
			key,
			sequence
		);

		let raw_tx = binToHex(encodeTransactionBCH(post.transaction));
		await broadcast(raw_tx);
		message = '';
	};

	const broadcast = async function (raw_tx: string) {
		let response = await electrumClient.request('blockchain.transaction.broadcast', raw_tx);
		sequence += 1;
		if (response instanceof Error) {
			connectionStatus = ConnectionStatus[electrumClient.status];
			throw response;
		}
		response as any[];
	};

	const newAuthBaton = async function () {
		let uname = cashAssemblyToHex(`OP_RETURN <"U3V"> <"pseudonymous">`);
		let sendResponse = await wallet.tokenGenesis({
			cashaddr: wallet.getTokenDepositAddress()!, // token UTXO recipient, if not specified will default to sender's address
			commitment: uname, // NFT Commitment message
			capability: NFTCapability.minting, // NFT capability
			value: 1_000_000 // Satoshi value
		});
	};

	const topUp = async function (amount: number) {
		balance = walletUnspent[0].value;
		thisAuth = walletUnspent[0].token_data.category;
		let uname = cashAssemblyToHex(`OP_RETURN <"U3V"> <"pseudonymous">`);

		let sendResponse = await wallet.send(
			new TokenSendRequest({
				cashaddr: wallet.getTokenDepositAddress()!,
				tokenId: thisAuth,
				commitment: uname, // NFT Commitment message
				capability: NFTCapability.minting, // NFT capability
				value: balance + amount // Satoshi value
			})
		);
		await updateWallet();
	};

	onMount(async () => {
		const isMainnet = page.url.hostname !== 'vox.cash';
		BaseWallet.StorageProvider = IndexedDBProvider;
		wallet = isMainnet ? await TestNetWallet.named(`vox`) : await Wallet.named(`vox`);
		key = getHdPrivateKey(wallet.mnemonic!, wallet.derivationPath.slice(0, -2), wallet.isTestnet);
		let bytecodeResult = cashAddressToLockingBytecode(wallet.getDepositAddress());
		if (typeof bytecodeResult == 'string') throw bytecodeResult;
		walletScriptHash = getScriptHash(bytecodeResult.bytecode);

		now = await wallet.provider.getBlockHeight();
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
		await updateWallet();
		await updateContract();
	});

	onDestroy(async () => {
		const electrumClient = new ElectrumClient(Channel.USER_AGENT, '1.4.1', server);
		await electrumClient.disconnect();
	});
</script>

<div class="box">
	<div class="row header">
		{now.toLocaleString()}<sub>■</sub>
		{sequence}

		<div style="flex: 2 2 auto;"></div>
		<b><a href="/pop/">/pop</a>/{topic}</b>
		<div style="flex: 2 2 auto;"></div>
		<BitauthLink template={Channel.template} />
		{#if connectionStatus == 'CONNECTED'}
			<img src={CONNECTED} alt={connectionStatus} />
		{:else}
			<img src={DISCONNECTED} alt="Disconnected" />
		{/if}
	</div>
	<div id="chat" class="row content">
		{#await transactions then build}
			{#each posts as post}
				<ChatPost {...post} />
				<div class="deleteMe">
					<button onclick={() => clearPost(post)}>
						<img height="24px" src={trash} />
					</button>
				</div>
			{/each}
		{:catch error}
			<p style="color: red">{error.message}</p>
		{/await}
	</div>
	<div class="row footer">
		<div class="edit"><textarea bind:value={message}></textarea></div>
		<div class="send">
			<div class="auth">
				{#if thisAuth}
					<img height="32px" src={blo(thisAuth, 16)} alt="avatar" />
				{/if}
				{#if walletUnspent.length > 0}
					<div style="font-size:x-small;">
						{parseUsername(walletUnspent[0].token_data.nft.commitment)}<br />
						{balance.toLocaleString()}sats
					</div>
				{/if}
			</div>
			<button onclick={() => send(message)}>Send</button>
		</div>
	</div>

	{#if walletUnspent.length > 0}
		<div class="row footer">
			<button onclick={() => topUp(10000000)}>Top up 10M sats</button>
			<button onclick={() => topUp(1000000)}>Top up 1M sats</button>
		</div>
	{/if}

	{#if walletUnspent.length == 0}
		<h2>Create new identity</h2>
		<button onclick={() => newAuthBaton()}>New identity 1M sats</button>
	{/if}
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
		overflow-y: scroll;
		overflow-x: hidden;
		max-height: 65vh;
	}

	.box .row.footer .edit {
		width: 100%;
		flex: 1 1 auto;
		background: #fff0f044;
		border: #666;
		border-width: 1px;
		padding: 5px;
	}
	.edit textarea {
		width: 100%;
		min-height: 10em;
	}

	.box .row.footer {
		background: #eeeeee22;
		flex: 0 1 auto;
		display: flex;
		flex-direction: row;
		height: auto;
		resize: none;
		padding: 10px;
	}

	.deleteMe {
		position: relative;
		overflow: visible;
		height: 0px;
		left: 40px;
		top: -25px;
	}
	.deleteMe button {
		background-color: #fff; /* Green */
		padding: 1px;
		border-radius: 20px;
	}
	.send {
		align-content: center;
		padding: 5px;
	}

	.auth {
		align-content: center;
		padding: 10px;
	}
	.auth img {
		border-radius: 50%;
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
