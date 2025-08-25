<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import walletIcon from '$lib/images/hot.svg';
	import hot from '$lib/images/hot.svg';
	import hotCT from '$lib/images/cashTokens.svg';
	import bch from '$lib/images/BCH.svg';

	import { cashAddressToLockingBytecode, stringify, swapEndianness } from '@bitauth/libauth';
	import { blo } from 'blo';

	import { getScriptHash, sumUtxoValue, type UtxoI } from '@unspent/tau';

	import { ElectrumClient, ConnectionStatus } from '@electrum-cash/network';

	import { IndexedDBProvider } from '@mainnet-cash/indexeddb-storage';
	import { BaseWallet, Wallet, TestNetWallet, TokenSendRequest } from 'mainnet-js';

	import CONNECTED from '$lib/images/connected.svg';
	import DISCONNECTED from '$lib/images/disconnected.svg';
	import Utxo from '$lib/Utxo.svelte';

	const isMainnet = page.url.hostname == 'vox.cash';
	let server = isMainnet ? 'bch.imaginary.cash' : 'chipnet.bch.ninja';

	let now = $state(0);
	let wallet: Wallet | TestNetWallet | undefined = $state();
	let walletError = false;
	let balance = $state(0);
	let electrumClient: any;
	let connectionError = $state('');
	let showTokenAddress = $state(true);
	let history: any[];
	let unspent: UtxoI[] = $state([]);
	let showInfo = $state(false);
	let scripthash = $state('');

	let showHistory = $state(false);
	let cancelWatch: any;

	const handleNotifications = function (data: any) {
		if (data.method === 'blockchain.headers.subscribe') {
			let d = data.params[0];
			now = d.height;
		} else if (data.method === 'blockchain.scripthash.subscribe') {
			updateWallet();
		} else {
			console.log(data);
		}
	};

	async function consolidateFungibleTokens() {
		const cashaddr = wallet.getTokenDepositAddress();
		let utxos = (await wallet.getUtxos())
			.filter((u: any) => u.token)
			.filter((u: any) => !u.token.capability);
		console.log(utxos);
		// Get a list of
		const categories = [
			...new Set(
				utxos.map((u: any) => {
					return u.token.tokenId;
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

		return await wallet.send(sendRequests);
	}

	async function consolidateSats() {
		return await wallet!.sendMax(wallet!.getDepositAddress());
	}

	const toggleSeed = () => {
		showInfo = !showInfo;
	};

	const updateWallet = async function () {
		console.log('updating wallet...');
		let response = await electrumClient.request(
			'blockchain.scripthash.listunspent',
			scripthash,
			'include_tokens'
		);
		if (response instanceof Error) throw response;
		unspent = response;

		balance = sumUtxoValue(unspent as UtxoI[], true);
	};

	onMount(async () => {
		try {
			const isTestnet = page.url.hostname !== 'vox.cash';
			BaseWallet.StorageProvider = IndexedDBProvider;
			wallet = isTestnet ? await TestNetWallet.named(`vox`) : await Wallet.named(`vox`);
			balance = (await wallet.getBalance('sat')) as number;

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
</script>

<section>
	<div class="status">
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
			{#if balance >= 0}
				<div>
						{balance!.toLocaleString()} sats
				</div>
			{/if}
		</div>

		{#if unspent}
			{#if unspent!.length > 0}
				<h3>Unspent Outputs (coins)</h3>
				{#each unspent! as u, i (u.tx_hash + ':' + u.tx_pos)}
					<Utxo {...u} />
				{/each}

				<div class="walletHead">
					<button onclick={() => consolidateFungibleTokens()}> Consolidate Tokens</button>
					<button onclick={() => consolidateSats()}> Consolidate Sats</button>
				</div>
			{:else}
				<p>no wallet utxos available</p>
			{/if}
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
					{#await wallet!.getHistory('sat', 0, 10, true)}
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
	pre {
		margin-block: 0px;
		padding: 0px;
		overflow: hidden;
		white-space: nowrap;
	}

	table {
		width: 100%;
		border-collapse: separate;
	}
	thead tr {
		text-align: center;
		font-weight: 900;
	}

	tbody tr:nth-child(odd) {
		background-color: #fd70da2a;
	}
	tbody tr:nth-child(even) {
		background-color: #e495e42c;
	}
	tbody tr {
		border-radius: 10px;
	}
	tbody tr td {
		padding: 4px;
	}

	.scanable {
		padding: 60px;
		background-color: white;
		border-radius: 30px;
		display: grid;
	}
	.scanable div {
		text-align: center;
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

	.r {
		text-align: right;
		vertical-align: middle;

		max-width: 90px;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
	}
</style>
