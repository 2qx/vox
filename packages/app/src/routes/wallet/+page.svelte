<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/state';
	import hot from '$lib/images/hot.svg';
	import hotCT from '$lib/images/cashTokens.svg';

	import BCMR from '$lib/bitcoin-cash-metadata-registry.json' with { type: 'json' };
	import tBCMR from '$lib/chipnet-metadata-registry.json' with { type: 'json' };
	import { Vault, CATEGORY_MAP, CATEGORY_MAP_CHIPNET } from '@fbch/lib';

	import {
		binToHex,
		cashAddressToLockingBytecode,
		encodeTransactionBch,
		stringify,
		swapEndianness
	} from '@bitauth/libauth';

	import { getScriptHash, sumUtxoValue, type UtxoI, getHdPrivateKey } from '@unspent/tau';

	import { ElectrumClient, ConnectionStatus } from '@electrum-cash/network';

	import { IndexedDBProvider } from '@mainnet-cash/indexeddb-storage';
	import { BaseWallet, Wallet, TestNetWallet, TokenSendRequest, WalletTypeEnum } from 'mainnet-js';

	import CONNECTED from '$lib/images/connected.svg';
	import DISCONNECTED from '$lib/images/disconnected.svg';
	import Utxo from '$lib/Utxo.svelte';
	import FutureUtxo from '$lib/FutureUtxo.svelte';

	const isMainnet = page.url.hostname == 'vox.cash';
	let server = isMainnet ? 'bch.imaginary.cash' : 'chipnet.bch.ninja';
	const metadata = isMainnet ? BCMR : tBCMR;
	const SERIES_MAP = isMainnet ? CATEGORY_MAP : CATEGORY_MAP_CHIPNET;

	let now = $state(0);
	let wallet: Wallet | TestNetWallet | undefined = $state();
	let key = $state('');
	let walletError = false;
	let balance = $state(0);
	let electrumClient: any;
	let connectionStatus = $state('');
	let connectionError = $state('');
	let showTokenAddress = $state(true);
	let unspent: UtxoI[] | undefined = $state([]);
	let assetsCash: UtxoI[] | undefined = $state([]);
	let assetsCommodity: UtxoI[] | undefined = $state([]);
	let assetsFuture: UtxoI[] | undefined = $state([]);
	let assetsAuth: UtxoI[] | undefined = $state([]);
	let assetsOther: UtxoI[] | undefined = $state([]);
	let showInfo = $state(false);
	let scripthash = $state('');

	let showHistory = $state(false);

	const bcmr = Object.entries(metadata.identities)
		.map((o) => {
			return Object.values(Object.values(o[1]));
		})
		.flat()
		.reduce((acc, o) => {
			acc.set(o.token.category, o);
			return acc;
		}, new Map());

	const handleNotifications = function (data: any) {
		if (data.method === 'blockchain.headers.subscribe') {
			connectionStatus = ConnectionStatus[electrumClient.status];
			let d = data.params[0];
			now = d.height;
		} else if (data.method === 'blockchain.scripthash.subscribe') {
			updateWallet();
		} else {
			console.log(data);
		}
	};

	async function redeemFutures(tx_hash: string, tx_pos: number, locktime: number, amount: number) {
		let utxoToRedeem = unspent?.filter((u) => (u.tx_hash == tx_hash && u.tx_pos == tx_pos)).pop();
		let vaultUtxos = await electrumClient.request(
			'blockchain.scripthash.listunspent',
			Vault.getScriptHash(locktime),
			'include_tokens'
		);

		vaultUtxos = vaultUtxos.filter(
			(u: UtxoI) => u.token_data?.category == utxoToRedeem?.token_data?.category
		);


		console.log(vaultUtxos)
		if (utxoToRedeem) {
			let walletUnspent = [...assetsCash!, utxoToRedeem];
			let swapTx = Vault.swap(-amount, vaultUtxos, walletUnspent, locktime, key);
			let transactionHex = binToHex(encodeTransactionBch(swapTx.transaction));
			console.log(transactionHex);
			broadcast(transactionHex);
		}
	}
	async function consolidateFungibleTokens() {
		const cashaddr = wallet!.getTokenDepositAddress();
		let utxos = (await wallet!.getUtxos())
			.filter((u: any) => u.token)
			.filter((u: any) => u.token.amount > 0)
			.filter((u: any) => !u.token.capability);

		let categoryIds = utxos.map((u) => u.token!.tokenId);
		// Get a list of
		let duplicateCategories = categoryIds.filter(
			(item, index) => categoryIds.indexOf(item) !== index
		);

		const categories = [
			...new Set(
				duplicateCategories.map((cat: any) => {
					return cat;
				})
			)
		];

		let sendRequests = categories.map((tokenId: any) => {
			const sumTokens = utxos
				.filter((u: any) => u.token.tokenId == tokenId && u.token.amount > 0n)
				.map((u: any) => u.token.amount || 0n)
				.reduce((a: any, b: any) => a + b, 0n);
			return new TokenSendRequest({
				cashaddr: cashaddr,
				value: 800,
				amount: sumTokens,
				tokenId: tokenId
			});
		});
		return await wallet!.send(sendRequests);
	}

	async function consolidateSats() {
		return await wallet!.sendMax(wallet!.getDepositAddress());
	}

	const toggleSeed = () => {
		showInfo = !showInfo;
	};

	const broadcast = async function (raw_tx: string) {
		let response = await electrumClient.request('blockchain.transaction.broadcast', raw_tx);
		if (response instanceof Error) {
			connectionStatus = ConnectionStatus[electrumClient.status];
			throw response;
		}
		response as any[];
	};

	const classifyUtxos = function (unspent: UtxoI[] | undefined) {
		let classifiedUtxos = Object.groupBy(unspent!, ({ token_data }) => {
			if (!token_data) {
				return 'cash';
			} else if (bcmr.has(token_data!.category) && Number(token_data?.amount) > 0) {
				return 'commodity';
			} else if (SERIES_MAP.has(token_data!.category)) {
				return 'future';
			} else if (token_data!.nft?.commitment.startsWith('6a035533')) {
				return 'auth';
			} else {
				return 'other';
			}
		});

		assetsCash = classifiedUtxos.cash;
		assetsCommodity = classifiedUtxos.commodity;
		assetsFuture = classifiedUtxos.future;
		assetsAuth = classifiedUtxos.auth;
		assetsOther = classifiedUtxos.other;
		return unspent;
	};

	const updateWallet = async function () {
		console.log('updating wallet...');
		let response = await electrumClient.request(
			'blockchain.scripthash.listunspent',
			scripthash,
			'include_tokens'
		);
		if (response instanceof Error) throw response;
		unspent = classifyUtxos(response);

		balance = sumUtxoValue(unspent as UtxoI[], true);
	};

	onMount(async () => {
		try {
			BaseWallet.StorageProvider = IndexedDBProvider;
			wallet = isMainnet ? await Wallet.named(`vox`) : await TestNetWallet.named(`vox`);

			key = getHdPrivateKey(wallet.mnemonic!, wallet.derivationPath.slice(0, -2), wallet.isTestnet);
			let lockingBytecode = cashAddressToLockingBytecode(wallet.getDepositAddress());
			if (typeof lockingBytecode == 'string') throw lockingBytecode;
			scripthash = getScriptHash(lockingBytecode.bytecode, true);
			// Initialize an electrum client.
			electrumClient = new ElectrumClient('vox/wallet', '1.4.1', server);

			try {
				// Wait for the client to connect.
				await electrumClient.connect();
				// Set up a callback function to handle new blocks.
			} catch (e) {
				connectionError = e;
			}

			// Listen for notifications.
			electrumClient.on('notification', handleNotifications);

			// Set up a subscription for new block headers.
			await electrumClient.subscribe('blockchain.scripthash.subscribe', scripthash);
			await electrumClient.subscribe('blockchain.headers.subscribe');

			await updateWallet();
		} catch (e) {
			walletError = true;
			throw e;
		}
	});

	onDestroy(async () => {
		await wallet!.provider.disconnect();
		await electrumClient.disconnect();
	});
</script>

<svelte:head>
	<title>👛 Wallet</title>
	<meta name="description" content="Vox Wallet." />
</svelte:head>

<section>
	<div class="status">
		{#if connectionStatus == 'CONNECTED'}
			<img src={CONNECTED} alt={connectionStatus} />
		{:else}
			<img src={DISCONNECTED} alt="Disconnected" />
		{/if}
		<div class="scanable">
			{#if wallet}
				{#if !showTokenAddress}
					<button
						onclick={() => {
							showTokenAddress = !showTokenAddress;
						}}
						aria-label="toggle address"
					>
						<qr-code
							id="qr1"
							contents={wallet.getDepositAddress()}
							module-color="#000"
							position-ring-color="#8dc351"
							position-center-color="#ff00ec"
							mask-x-to-y-ratio="1.2"
							style="width: 150px;
                height: 150px;
                margin: 0.5em auto;
                background-color: #fff;"
						>
							<img src={hot} width="30px" slot="icon" />
						</qr-code>
					</button>

					<p id="deposit" style="text-align: center;">{wallet.getDepositAddress()}</p>
				{:else}
					<button
						onclick={() => {
							showTokenAddress = !showTokenAddress;
						}}
						aria-label="toggle address"
					>
						<qr-code
							id="qr1"
							contents={wallet.getTokenDepositAddress()}
							module-color="#000"
							position-ring-color="#8dc351"
							position-center-color="#ff00ec"
							mask-x-to-y-ratio="1.2"
							style="width: 150px;
                height: 150px;
                margin: 0.5em auto;
                background-color: #fff;"
						>
							<img src={hotCT} width="30px" slot="icon" />
						</qr-code>
					</button>
					<p id="deposit" style="text-align: center;">{wallet.getTokenDepositAddress()}</p>
				{/if}
			{/if}
			{#if connectionError}
				<b>{connectionError}</b>
			{/if}
		</div>
	</div>
	<div>
		{#if unspent}
			{#if assetsCash!.length > 0}
				<h3>assets : cash</h3>
				{#each assetsCash! as u, i (u.tx_hash + ':' + u.tx_pos)}
					<Utxo {...u} {...{ isMainnet: isMainnet }} />
				{/each}
			{/if}
			{#if assetsCommodity!.length > 0}
				<h3>assets : commodities</h3>
				{#each assetsCommodity! as u, i (u.tx_hash + ':' + u.tx_pos)}
					<Utxo {...u} {...{ isMainnet: isMainnet }} />
				{/each}
			{/if}
			{#if assetsFuture.length > 0}
				<h3>assets : commodities : futures</h3>
				{#each assetsFuture as u, i (u.tx_hash + ':' + u.tx_pos)}
					<FutureUtxo
						{...u}
						{...{ isMainnet: isMainnet }}
						locktime={SERIES_MAP.get(u.token_data?.category)}
						{now}
						{redeemFutures}
					/>
				{/each}
			{/if}

			{#if assetsAuth.length > 0}
				<h3>assets : authentication</h3>
				{#each assetsAuth as u, i (u.tx_hash + ':' + u.tx_pos)}
					<Utxo {...u} {...{ isMainnet: isMainnet }} />
				{/each}
			{/if}

			{#if assetsOther!.length > 0}
				<h3>assets : other</h3>
				{#each assetsOther! as u, i (u.tx_hash + ':' + u.tx_pos)}
					<Utxo {...u} {isMainnet} />
				{/each}
			{/if}
			<div class="walletHead">
				<button onclick={() => consolidateFungibleTokens()}> Consolidate Tokens</button>
				<button onclick={() => consolidateSats()}> Consolidate Sats</button>
			</div>
		{:else}
			<p>loading wallet...</p>
		{/if}

		{#if wallet}
			<div class="showSeed">
				<button onclick={toggleSeed}>Show/hide backup</button>
				{#if showInfo}
					<h3>DO NOT SHARE WITH ANYONE!</h3>
					<p>
						{wallet!.toDbString()}
					</p>
					Note: vox.cash {new Date().toLocaleDateString()}
				{/if}
			</div>

			<div class="history">
				<button
					onclick={() => {
						showHistory = !showHistory;
					}}
				>
					Show/hide History
				</button>
				{#if showHistory}
					<h3>History</h3>
					{#await wallet!.getHistory({ unit: 'sat', fromHeight: now - 10 })}
						<p>...getting history</p>
					{:then history}
						{#if history.length > 0}
							{#each history as c, i (c.hash)}
								{#if c!.timestamp > 0}
									<pre>{new Date(c!.timestamp * 1000).toISOString()}</pre>
								{:else}
									<pre>{new Date().toISOString()}</pre>
								{/if}
								<pre># {c.blockHeight}■ {c.hash} </pre>
								<pre>  assets:cash    {c.valueChange.toLocaleString().padStart(14)} sat</pre>
								<pre>  expenses:fees  {c.fee
										.toLocaleString()
										.padStart(14)} sat # {c.size} bytes</pre>
								{#each c.tokenAmountChanges as tokenChange}
									{#if tokenChange.amount != 0n}
										<pre>  assets:cash:tokens  {tokenChange.amount.toLocaleString()} {tokenChange.tokenId} </pre>
									{/if}
								{/each}
								<pre>   &nbsp;</pre>
							{/each}
						{:else}
							<p>no history</p>
						{/if}
					{:catch error}
						<p style="color: red">{error.message}</p>
					{/await}
				{/if}
			</div>
		{/if}
	</div>
</section>

<style>
	.status {
		text-align: end;
	}

	h3 {
		margin-block-end: 0px;
	}

	pre {
		margin-block: 0px;
		padding: 0px;
		overflow: hidden;
		white-space: nowrap;
	}

	.scanable {
		padding: 60px;
		background-color: white;
		border-radius: 30px;
		display: grid;
	}

	.scanable button {
		text-align: center;
		background-color: #fff;
	}

	button {
		background-color: #a45eb6; /* Green */
		border: none;
		color: white;
		padding: 15px 15px;
		border-radius: 20px;
		text-align: center;
		text-decoration: none;
		display: inline-block;
		font-size: 16px;
		margin: auto;
	}

	.walletHead {
		padding: 15px 15px;
		display: flex;
	}

	.showSeed {
		padding: 25px;
	}
</style>
