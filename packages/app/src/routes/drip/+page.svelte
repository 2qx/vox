<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/state';

	import {
		decodeTransactionBch,
		binToHex,
		hexToBin,
		swapEndianness,
		hash256
	} from '@bitauth/libauth';
	import Readme from './README.md';

	import { blo } from 'blo';
	// Import library features.
	import { ElectrumClient, ConnectionStatus } from '@electrum-cash/network';
	import Drip from '@unspent/drip';

	import dripIcon from '$lib/images/drip.svg';
	import CONNECTED from '$lib/images/connected.svg';
	import DISCONNECTED from '$lib/images/disconnected.svg';
	import BitauthLink from '$lib/BitauthLink.svelte';

	let unspent: any[] = [];
	let electrumClient: any;
	let scripthash = '';
	scripthash = Drip.getScriptHash();
	let contractState = '';
	let connectionStatus = '';
	let spent = new Set();

	let timer: any;

	let prefix = page.url.hostname == 'vox.cash' ? 'bitcoincash' : 'bchtest';
	let server = page.url.hostname == 'vox.cash' ? 'bch.imaginary.cash' : 'chipnet.bch.ninja';

	const debounceClearSpent = () => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			spent = new Set();
		}, 10000);
	};

	const handleNotifications = function (data: any) {
		if (data.method === 'blockchain.scripthash.subscribe') {
			if (data.params[1] !== contractState) {
				contractState = data.params[1];
				connectionStatus = ConnectionStatus[electrumClient.status];
				updateUnspent();
			}
		} else {
			console.log(data);
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

	const processAllOutputs = function () {
		unspent
			.filter((i: any) => i.height > 0)
			.map((u, i) => {
				processOutput(u, i);
			});
	};

	const processOutput = async function (utxo: any, index: number) {
		let txn_hex = Drip.processOutpoint(utxo);
		let transaction = decodeTransactionBch(hexToBin(txn_hex));
		if (typeof transaction === 'string') throw transaction;
		spent.add(`${utxo.tx_hash}":"${utxo.tx_pos}`);
		debounceClearSpent();

		let new_id = swapEndianness(binToHex(hash256(hexToBin(txn_hex))));

		let outValue = Number(transaction.outputs[0].valueSatoshis);
		unspent.splice(index, 1);

		let insertIdx = unspent.filter((i) =>
			i.height > 0
				? true
				: i.value < outValue
					? true
					: i.value == outValue && i.tx_hash < new_id
						? true
						: false
		).length;
		unspent.splice(insertIdx, 0, {
			height: 0,
			tx_hash: new_id,
			value: outValue
		});
		unspent = unspent;
		await broadcast(txn_hex);
	};

	const updateUnspent = async function () {
		let response = await electrumClient.request(
			'blockchain.scripthash.listunspent',
			scripthash,
			'exclude_tokens'
		);
		if (response instanceof Error) throw response;
		let unspentIds = new Set(response.map((utxo: any) => `${utxo.tx_hash}":"${utxo.tx_pos}`));
		if (unspent.length == 0 || spent.intersection(unspentIds).size == 0) {
			unspent = response;
		}
	};

	onMount(async () => {
		// Initialize an electrum client.
		electrumClient = new ElectrumClient(Drip.USER_AGENT, '1.4.1', server);

		// Wait for the client to connect.
		await electrumClient.connect();
		// Set up a callback function to handle new blocks.

		// Listen for notifications.
		electrumClient.on('notification', handleNotifications);

		// Set up a subscription for new block headers.
		await electrumClient.subscribe('blockchain.scripthash.subscribe', scripthash);
		updateUnspent();
	});

	onDestroy(async () => {
		await electrumClient.disconnect();
	});
</script>

<svelte:head>
	<title>💧 Drip Mine</title>
	<meta name="description" content="Release miner extractable value (MEV)!" />
</svelte:head>

<section>
	<div class="status">
		<BitauthLink template={Drip.template} />
		{#if connectionStatus == 'CONNECTED'}
			<img src={CONNECTED} alt={connectionStatus} />
		{:else}
			<img src={DISCONNECTED} alt="Disconnected" />
		{/if}
	</div>
	<h1>Release miner extractable value (MEV)</h1>
	{#if connectionStatus == 'CONNECTED'}
		<div class="header">
			<button onclick={() => processAllOutputs()}>Release all Miner Extractable Value (MEV)</button>
		</div>
		<h3>Unspent Transaction Outputs (utxos)</h3>
		<div class="grid">
			{#if unspent.filter((i: any) => i.height > 0).length > 0}
				{#each unspent.filter((i: any) => i.height > 0).slice(0,45) as item, index}
					<div class="row">
						<button onclick={() => processOutput(item, index)}>
							<img src={blo(`0x${item.tx_hash}`, 32)} alt={item.tx_hash} />
							<!-- <p>{Number(item.value).toLocaleString()}</p> -->
						</button>
					</div>
				{/each}
			{:else}
				<p>No spendable outputs, check back in 10 minutes.</p>
			{/if}
		</div>
		<h3>Mempool Transactions</h3>
		<div class="grid">
			{#if unspent.filter((i: any) => i.height <= 0).length > 0}
				{#each unspent.filter((i: any) => i.height <= 0) as item, index}
					<div class="row">
						<button disabled>
							<img src={blo(`0x${item.tx_hash}`, 32)} alt={item.tx_hash} />
							<!-- <p>{Number(item.value).toLocaleString()}</p> -->
						</button>
					</div>
				{/each}
			{:else}
				<p>No pending transactions</p>
			{/if}
		</div>
	{:else}
		<div class="swap">
			<p>Not connected?</p>
		</div>
	{/if}
	<Readme />
	<qr-code
		id="qr1"
		contents={Drip.getAddress(prefix)}
		module-color="#000"
		position-ring-color="#0052ef"
		position-center-color="#b7ffff"
		mask-x-to-y-ratio="1.2"
		style="width: 150px;
									height: 150px;
									margin: 0.5em auto;
									background-color: #fff;"
	>
		<img src={dripIcon} width=50px slot="icon" alt="drip MEV icon" />
	</qr-code>
	<pre id="deposit">{Drip.getAddress(prefix)}</pre>
</section>

<style>
	section {
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	.status {
		text-align: end;
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

	.grid {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		align-items: flex-start;
		text-align: center;
	}

	.grid .row {
		grid-gap: 0.2rem;
	}

	button {
		padding: 0px;
	}
	button p {
		font-size: x-small;
		font-weight: 400;
		margin: 0px;
	}
	button:disabled {
		filter: grayscale(100%);
	}

	.header button {
		background-color: #a45eb6; /* Green */
		border: none;
		color: white;
		padding: 15px 32px;
		margin: auto;
		border-radius: 20px;
		text-decoration: none;
		display: inline-block;
		font-size: 16px;
	}

	.header {
		padding: 15px 16px;
		display: flex;
	}
</style>
