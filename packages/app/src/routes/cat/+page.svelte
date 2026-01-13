<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { PageProps } from './$types';

	import Chat from '$lib/Chat.svelte';
	import Transaction from '$lib/Transaction.svelte';
	import CatDexOrder from '$lib/CatDexOrder.svelte';
	import Utxo from '$lib/Utxo.svelte';

	import BCMR from '$lib/bitcoin-cash-metadata-registry.json' with { type: 'json' };
	import tBCMR from '$lib/chipnet-metadata-registry.json' with { type: 'json' };

	import Readme from './README.md';

	import { default as CatDex, getAllMarketOrders } from '@unspent/catdex';

	import SmallIndex from '@unspent/small';

	import BitauthLink from '$lib/BitauthLink.svelte';
	import CONNECTED from '$lib/images/connected.svg';
	import DISCONNECTED from '$lib/images/disconnected.svg';

	import {
		binToHex,
		cashAddressToLockingBytecode,
		encodeTransactionBch,
		stringify
	} from '@bitauth/libauth';

	import { ElectrumClient, ConnectionStatus } from '@electrum-cash/network';
	import { BaseWallet, Wallet, TestNetWallet, NFTCapability, TokenMintRequest } from 'mainnet-js';

	import { IndexedDBProvider } from '@mainnet-cash/indexeddb-storage';

	import BCH from '$lib/images/BCH.svg';
	import tBCH from '$lib/images/tBCH.svg';

	import {
		cashAssemblyToHex,
		getScriptHash,
		getHdPrivateKey,
		sumUtxoValue,
		sumTokenAmounts,
		type UtxoI
	} from '@unspent/tau';
	import TokenIcon from '$lib/TokenIcon.svelte';
	import Ticker from '$lib/Ticker.svelte';

	let { data }: PageProps = $props();
	let selectedAsset = $state(data.asset);

	let now: number = $state(0);

	let key = $state('');
	let coupons: any[] | undefined = $state();
	let electrumClient: any;
	let walletScriptHash = $state('');
	let amount = $state(0n);
	let connectionStatus = $state('');
	let contractState = $state('');
	let timer: any;

	let unspent: any[] = $state([]);
	let walletUnspent: any[] = $state([]);
	let orders: any[] = $state([]);
	let myOrders: any[] = $state([]);
	let myOrderBook: any[] = $state([]);
	let myMarketRecord: any = $state();
	let myMarketTokens: any = $state();
	let myMarketSatoshis: any = $state();
	let myMembership: any = $state(0);
	let myAuthBatons: any[] = $state([]);
	let myDexUtxos: any[] = $state([]);
	let authBatons: any[] = $state([]);
	let showSettings = $state(false);
	let showChat = $state(false);

	let transaction_hex = '';
	let transaction: any = $state(undefined);
	let transactionValid = $state(false);
	let sourceOutputs: any = $state();
	let transactionError: string | boolean = $state('');

	let balance = $state(0);
	let assetBalance = $state(0n);

	const isMainnet = page.url.hostname == 'vox.cash';
	const prefix = isMainnet ? 'bitcoincash' : 'bchtest';
	const baseTicker = isMainnet ? 'BCH' : 'tBCH';
	const server = isMainnet ? 'bch.imaginary.cash' : 'chipnet.bch.ninja';
	const metadata = isMainnet ? BCMR : tBCMR;
	const bchIcon = isMainnet ? BCH : tBCH;

	if (typeof selectedAsset !== 'string') {
		selectedAsset = isMainnet
			? '7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c'
			: 'ffc9d3b3488e890ef113b1c74f40e1f5eb1147a7d4191cecac89fd515721a271';
	}

	const protocol_prefix = cashAssemblyToHex(`OP_RETURN <"${CatDex.PROTOCOL_IDENTIFIER}">`);

	let wallet: any;

	const bcmr = Object.entries(metadata.identities)
		.map((o) => {
			return Object.values(Object.values(o[1]));
		})
		.flat()
		.filter((o) => o.extensions && o.extensions.exchanges == 'catdex')
		.reduce((acc, o) => {
			acc.set(o.token.category, o);
			return acc;
		}, new Map());

	const debounceUpdateWallet = () => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			updateWallet();
			updateOrders();
		}, 1500);
	};

	async function updateOrders() {
		if (electrumClient && now > 1000) {
			let marketMakers = await electrumClient.request(
				'blockchain.scripthash.listunspent',
				SmallIndex.getScriptHash(CatDex.PROTOCOL_IDENTIFIER),
				'include_tokens'
			);

			authBatons = marketMakers
				.map((u: UtxoI) => {
					return u.token_data?.category;
				})
				.filter((v: number, i: number, array: string[]) => array.indexOf(v) === i);

			let marketScriptHashes = authBatons.map((authCat: string) => {
				return CatDex.getScriptHash(authCat, selectedAsset);
			});

			let rawOrders = await getAllMarketOrders(electrumClient, marketScriptHashes);
			let utxos = Array.from(rawOrders.values());
			orders = CatDex.getCatDexOrdersFromUtxos(selectedAsset, utxos);

			if (myAuthBatons.length > 0) {
				let myRawOrders = await getAllMarketOrders(electrumClient, [
					CatDex.getScriptHash(myAuthBatons[0].token_data.category, selectedAsset)
				]);

				myDexUtxos = Array.from(myRawOrders.values());

				myMarketTokens = sumTokenAmounts(myDexUtxos, selectedAsset);
				myMarketSatoshis = sumUtxoValue(myDexUtxos);
				myOrders = CatDex.getCatDexOrdersFromUtxos(selectedAsset, myDexUtxos);
			}
		}
	}

	const updateWallet = async function () {
		let response = await electrumClient.request(
			'blockchain.scripthash.listunspent',
			walletScriptHash,
			'include_tokens'
		);
		if (response instanceof Error) throw response;

		myAuthBatons = response.filter(
			(u: UtxoI) =>
				u.token_data && u.token_data.nft && u.token_data.nft.commitment.startsWith(protocol_prefix)
		);

		if (typeof selectedAsset == 'string') {
			walletUnspent = response.filter(
				(u: UtxoI) => !u.token_data || u.token_data.category == selectedAsset
			);
			assetBalance = sumTokenAmounts(walletUnspent, selectedAsset);
		} else {
			walletUnspent = response.filter((u: UtxoI) => !u.token_data);
			assetBalance = 0n;
		}
		balance = sumUtxoValue(walletUnspent, true);
	};

	const newAuthBaton = async function () {
		await wallet.sendMax(wallet.getDepositAddress());
		let uname = cashAssemblyToHex(
			`OP_RETURN <"${CatDex.PROTOCOL_IDENTIFIER}"> <"markets are made">`
		);
		let sendResponse = await wallet.tokenGenesis({
			cashaddr: wallet.getTokenDepositAddress()!, // token UTXO recipient, if not specified will default to sender's address
			commitment: uname, // NFT Commitment message
			capability: NFTCapability.minting, // NFT capability
			value: 800 // Satoshi value
		});
	};

	const announceAuthBaton = async function (duration: number) {
		let message = cashAssemblyToHex(`OP_RETURN <"markets are made">`);
		let sendResponse = await wallet.tokenMint(myAuthBatons[0].token_data.category, [
			new TokenMintRequest({
				cashaddr: SmallIndex.getAddress(CatDex.PROTOCOL_IDENTIFIER)!,
				commitment: message,
				capability: NFTCapability.none,
				value: duration
			})
		]);
	};

	const updateAsset = async function () {
		await updateWallet();
		await updateOrders();
		if (typeof selectedAsset == 'string') {
			goto(`?asset=${selectedAsset}`, { keepFocus: true });
			assetBalance = sumTokenAmounts(walletUnspent, selectedAsset);
		} else {
			assetBalance = 0n;
		}
	};

	const addMyOrder = function (i: number) {
		if (myOrderBook.length + 1 == i) {
			myOrderBook.splice(i, 0, { quantity: undefined, price: undefined });
		} else if (myOrderBook.length >= 2) {
			let o = myOrderBook.slice(-2);
			myOrderBook.push({
				quantity: o[1].quantity - (o[0].quantity - o[1].quantity),
				price: o[1].price - (o[0].price - o[1].price)
			});
		} else {
			myOrderBook.push({ quantity: undefined, price: undefined });
		}
	};

	const dropOrder = function (i) {
		myOrderBook.splice(i, 1);
	};

	const postOrders = async function (replace = false) {
		let oldOrders = replace ? myDexUtxos : [];

		let tx = CatDex.administer(
			myAuthBatons[0],
			selectedAsset!,
			oldOrders,
			myOrderBook,
			walletUnspent,
			key
		);
		let transaction_hex = binToHex(encodeTransactionBch(tx.transaction));
		let response = await broadcast(transaction_hex);
		if (response.length == 64) myOrderBook = [];
	};

	const updateSwap = function () {
		if (amount) {
			try {
				let result = CatDex.swap(BigInt(amount), orders, walletUnspent, key);
				transaction = result.transaction;
				sourceOutputs = result.sourceOutputs;
				transaction_hex = binToHex(encodeTransactionBch(transaction));
				transactionValid = result.verify === true ? true : false;
				if (result.verify === true) transactionError = '';
			} catch (error: any) {
				transaction = undefined;
				sourceOutputs = undefined;
				transaction_hex = '';
				transactionValid = false;
				transactionError = error;
			}
		}
	};

	const broadcast = async function (raw_tx: string) {
		let response = await electrumClient.request('blockchain.transaction.broadcast', raw_tx);
		if (response instanceof Error) {
			connectionStatus = ConnectionStatus[electrumClient.status];
			transactionError = response.message;
			throw response;
		}
		response as any[];
		transaction = undefined;
		sourceOutputs = undefined;
		transaction_hex = '';
		transactionValid = false;
		return response;
	};

	const handleNotifications = function (data: any) {
		connectionStatus = ConnectionStatus[electrumClient.status];
		if (data.method === 'blockchain.headers.subscribe') {
			let d = data.params[0];
			now = d.height;
			updateOrders();
			updateWallet();
		} else if (data.method === 'blockchain.scripthash.subscribe') {
			// data.params[0]
			// TODO: only update matching utxos
			debounceUpdateWallet();
		} else {
			console.log(data);
		}
	};

	onMount(async () => {
		BaseWallet.StorageProvider = IndexedDBProvider;
		wallet = isMainnet ? await Wallet.named(`vox`) : await TestNetWallet.named(`vox`);

		key = getHdPrivateKey(wallet.mnemonic!, wallet.derivationPath.slice(0, -2), wallet.isTestnet);
		let lockcodeResult = cashAddressToLockingBytecode(wallet.getDepositAddress());
		if (typeof lockcodeResult == 'string') throw lockcodeResult;
		walletScriptHash = getScriptHash(lockcodeResult.bytecode);

		// Initialize an electrum client.
		electrumClient = new ElectrumClient(CatDex.USER_AGENT, '1.4.1', server);

		// Wait for the client to connect.
		await electrumClient.connect();
		// Set up a callback function to handle new blocks.

		// Listen for notifications.
		electrumClient.on('notification', handleNotifications);

		// Set up a subscription for new block headers.
		await electrumClient.subscribe('blockchain.headers.subscribe');

		await electrumClient.subscribe('blockchain.scripthash.subscribe', walletScriptHash);

		// Get a list of
		let marketMakers = await electrumClient.request(
			'blockchain.scripthash.listunspent',
			SmallIndex.getScriptHash(CatDex.PROTOCOL_IDENTIFIER),
			'include_tokens'
		);

		authBatons = marketMakers.map((u: UtxoI) => {
			return u.token_data?.category;
		});

		myMarketRecord = marketMakers
			.filter((u) => u.token_data?.category == myAuthBatons[0].token_data.category)
			.pop();

		if (myMarketRecord) {
			if (myMarketRecord.height <= 0) {
				myMembership = 1000;
			} else if (myMarketRecord.height > 0) {
				myMembership = myMarketRecord.height + myMarketRecord.value - now;
			} else {
				myMembership = 0;
			}
		} else {
			myMembership = 0;
		}

		let marketScriptHashes = authBatons.map((authCat: string) => {
			return CatDex.getScriptHash(authCat, selectedAsset);
		});

		marketScriptHashes.map(async (s) => {
			await electrumClient.subscribe('blockchain.scripthash.subscribe', s);
		});

		await electrumClient.subscribe(
			'blockchain.scripthash.subscribe',
			SmallIndex.getScriptHash(CatDex.PROTOCOL_IDENTIFIER)
		);
	});

	onDestroy(async () => {
		await wallet!.provider.disconnect();
		await electrumClient.disconnect();
	});
</script>

{#if showChat}
	<div class="trollbox">
		<Chat topic={CatDex.PROTOCOL_IDENTIFIER} />
		<label class="switch">
			Hide
			<input type="checkbox" bind:checked={showChat} />
			<span class="slider round"></span>
		</label>
	</div>
{/if}

<svelte:head>
	<title>🐱 CatDex</title>
	<meta
		name="description"
		content="CatDex - a decentralized limit order exchange and dex aggregator on Bitcoin Cash."
	/>
</svelte:head>

<section>
	<div class="status">
		<BitauthLink template={CatDex.template} />
		{#if connectionStatus == 'CONNECTED'}
			<img src={CONNECTED} alt={connectionStatus} />
		{:else}
			<img src={DISCONNECTED} alt="Disconnected" />
		{/if}
	</div>

	<h1>Trade CashTokens</h1>
	{#if connectionStatus == 'CONNECTED'}
		<b>Asset:</b>
		<select bind:value={selectedAsset} onchange={() => updateAsset()}>
			{#each bcmr.keys() as token}
				<option value={token}>
					{bcmr.get(token).name}
				</option>
			{/each}
		</select>
		<br />
		{#if selectedAsset}
			<div class="swap">
				<div>
					<img width="50" src={bchIcon} alt={baseTicker} />
					<br />
					{balance.toLocaleString()} sats {baseTicker}
				</div>
				<div>
					<img
						width="50"
						src={bcmr.get(selectedAsset).uris.icon}
						alt={bcmr.get(selectedAsset).token.symbol}
					/>
					<br />
					{(
						assetBalance / BigInt(Math.pow(10, bcmr.get(selectedAsset).token.decimals))
					).toLocaleString()}
					{bcmr.get(selectedAsset).token.symbol}
				</div>
			</div>
		{/if}
		<br />

		{#if balance > 0}
			<div class="swap">
				<label>Swap amount: </label>
				<input type="number" bind:value={amount} min="0" max="10" onchange={() => updateSwap()} />
			</div>
		{:else}
			<div class="swap">
				<p><a href="/wallet">Deposit funds</a> to trade assets.</p>
			</div>
		{/if}
		<br />
		{#if transaction && transactionValid}
			<div class="swap">
				<button onclick={() => broadcast(transaction_hex)}>Broadcast</button>
			</div>
			<Transaction {transaction} {sourceOutputs} category={selectedAsset} />
		{/if}
		{transactionError}

		<div class="orderBooks">
			<div>
				{#each orders.filter((o) => o.quantity > 0) as o}
					<CatDexOrder {...o} assetCategory={selectedAsset} {...{ isMainnet: isMainnet }} />
				{/each}
			</div>
			<div class="askBook">
				{#each orders.filter((o) => o.quantity < 0).toReversed() as o}
					<CatDexOrder {...o} assetCategory={selectedAsset} {...{ isMainnet: isMainnet }} />
				{/each}
			</div>
		</div>

		<h3>Advanced</h3>

		<label class="switch">
			<input type="checkbox" bind:checked={showSettings} />
			<span class="slider round"></span>
		</label>
		<br />

		{#if showSettings}
			<br />
			<div>
				{#if myAuthBatons.length > 0 && myMembership < 1000}
					<div>
						<p>
							You have a CatDex baton. <br />
							For others to can find your orders, announce your membership in the CatDex.
						</p>
						<button onclick={() => announceAuthBaton(4364)}>Month (4364 sats)</button>
						<button onclick={() => announceAuthBaton(52596)}>Year (52596 sats) </button>
						<p>Membership fees are non-refundable and are claimed by miners.</p>
						{#if myMembership > 0}
							<b
								>Membership expires in {myMembership} blocks. Renew now to have your orders discoverable.</b
							>
						{:else if myMembership < -2}
							<b
								>Membership expired {myMembership} blocks ago. Renew now to keep your orders discoverable.</b
							>
						{/if}
					</div>

					<br />
				{/if}

				{#if balance < 1000 && walletUnspent.length == 0}
					<a href="/wallet">Deposit funds</a> to create a CatDex authentication baton.
				{:else if myAuthBatons.length == 0}
					<p>To write orders, you need to create a CatDex Authentication Baton (1000 sats).</p>
					<button onclick={() => newAuthBaton()}>Create a new Baton</button>
				{:else}
					<h3>Your Decentralized Listing</h3>
					{#each myAuthBatons as authBaton}
						<TokenIcon size={24} category={authBaton.token_data.category}></TokenIcon>
					{/each}
					<div class="swap">
						{#if myMarketSatoshis}
							<div>
								<img width="24" src={bchIcon} alt={baseTicker} />
								<br />
								{myMarketSatoshis.toLocaleString()} sats {baseTicker}
							</div>
						{/if}
						{#if myMarketTokens}
							<div>
								<img
									width="24"
									src={bcmr.get(selectedAsset).uris.icon}
									alt={bcmr.get(selectedAsset).token.symbol}
								/>
								<br />
								{(
									myMarketTokens / BigInt(Math.pow(10, bcmr.get(selectedAsset).token.decimals))
								).toLocaleString()}
								{bcmr.get(selectedAsset).token.symbol}
							</div>
						{/if}
					</div>

					{#each myOrders as o}
						<CatDexOrder {...o} assetCategory={selectedAsset} {...{ isMainnet: isMainnet }} />
					{/each}

					<br />
					{#if myOrderBook.length > 0}
						<button onclick={() => postOrders(true)}>Replace Orders</button>

						<button onclick={() => postOrders()}>Append Orders</button>
					{:else}
						<button onclick={() => postOrders(true)}> Clear Orders </button>
						<button onclick={() => addMyOrder(0)}>New Orders</button><br />
					{/if}

					{#if myOrderBook.length > 0}
						<div class="orders">
							<div class="in">
								<b>type</b>
							</div>
							<div class="in">
								<b>price</b>
							</div>
							<div class="in">
								<b>quantity</b>
							</div>
							<div class="in"></div>
							<div class="listButtons"></div>
						</div>
					{/if}
					{#each myOrderBook as o, i}
						<div class="orders">
							<div class="in">
								{#if o.quantity > 0}
									BID
								{:else if o.quantity < 0}
									ASK
								{:else}
									-
								{/if}
							</div>
							<div class="in">
								<input
									type="number"
									placeholder="sats per"
									bind:value={o.price}
									min="1"
									max="100000"
								/>
							</div>
							<div class="in">
								<input name="quantity" placeholder="qty" type="number" bind:value={o.quantity} />
								<TokenIcon size={24} category={selectedAsset}></TokenIcon>
							</div>

							<div class="in">
								{#if o.quantity * o.price > 0}
									{Number(o.quantity * o.price).toLocaleString()} sats
								{/if}
							</div>
							<div class="listButtons">
								<button onclick={() => addMyOrder(i + 1)}>+</button>
								<button
									onclick={() => {
										dropOrder(i);
									}}>-</button
								>
							</div>
						</div>
					{/each}

					{#if myOrderBook.length > 0}
						<p>
							Sell is negative quantity.<br />
							All prices in satoshis
						</p>
					{/if}
					<br />
				{/if}
			</div>
		{/if}
		<br />
		<br />
		<h3>Makers</h3>
		<div class="grid">
			{#each authBatons as authBaton}
				<div>
					<TokenIcon category={authBaton} size={24}></TokenIcon>
				</div>
			{/each}
		</div>
	{:else}
		<div class="swap">
			<p>Not connected.</p>
		</div>
	{/if}

	<h3>Chat</h3>
	<label class="switch">
		<input type="checkbox" bind:checked={showChat} />
		<span class="slider round"></span>
	</label>

	<Readme />
</section>

<style>
	.trollbox {
		position: fixed;
		right: 0px;
		bottom: 0px;
		background: #ffffffbb;
		z-index: 1;
		max-width: 40em;
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

	.status {
		text-align: end;
	}

	.orderBooks {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
	}

	.orderBooks div {
		align-items: center;
	}

	.orders {
		display: flex;
		margin: 5px;
	}

	.orders .in {
		display: flex;
		flex: 1;
		align-items: center;
	}

	.orders .in input {
		max-width: 110px;
		border-radius: 5px;
	}
	.orders .listButtons {
		display: flex;
		flex: 1;
	}

	.orders .listButtons button {
		padding: 0px;
		width: 40%;
	}

	.grid {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		align-items: flex-start;
		text-align: center;
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

	.switch {
		position: relative;
		display: inline-block;
		width: 60px;
		height: 34px;
	}

	/* Hide default HTML checkbox */
	.switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	/* The slider */
	.slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #ccc;
		-webkit-transition: 0.4s;
		transition: 0.4s;
	}

	.slider:before {
		position: absolute;
		content: '';
		height: 26px;
		width: 26px;
		left: 4px;
		bottom: 4px;
		background-color: white;
		-webkit-transition: 0.4s;
		transition: 0.4s;
	}

	input:checked + .slider {
		background-color: #a45eb6;
	}

	input:focus + .slider {
		box-shadow: 0 0 1px #a45eb6;
	}

	input:checked + .slider:before {
		-webkit-transform: translateX(26px);
		-ms-transform: translateX(26px);
		transform: translateX(26px);
	}

	/* Rounded sliders */
	.slider.round {
		border-radius: 34px;
	}

	.slider.round:before {
		border-radius: 50%;
	}
</style>
