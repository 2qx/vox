<script lang="ts">
	import { encodeTransactionBCH, binToHex } from '@bitauth/libauth';
	import { blo } from 'blo';
	// Import library features.
	import { ElectrumClient, ConnectionStatus } from '@electrum-cash/network';
	import { Drip } from '@unspent/drip';
	import { onMount, onDestroy } from 'svelte';

	import CONNECTED from '$lib/images/connected.svg';
	import DISCONNECTED from '$lib/images/disconnected.svg';
	let unspent: any[] = [];
	let electrumClient: any;
	let scripthash = Drip.getScriptHash();
	let contractState = '';
	let connectionStatus = '';

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
		if (response instanceof Error){
			connectionStatus = ConnectionStatus[electrumClient.status];
			throw response
		};
		response as any[];
	};

	const processOutput = async function (utxo: any, index: number) {
		unspent.splice(index, 1);
		let txn = Drip.processOutpoint(utxo);
		let raw_tx = binToHex(encodeTransactionBCH(txn));
		console.log(raw_tx);
		await broadcast(raw_tx);
	};

	const updateUnspent = async function () {
		let response = await electrumClient.request('blockchain.scripthash.listunspent', scripthash);
		if (response instanceof Error) throw response;
		unspent = response as any[];
	};

	onMount(async () => {
		// Initialize an electrum client.
		electrumClient = new ElectrumClient('unspent/drip', '1.4.1', 'bch.imaginary.cash');
		// Wait for the client to connect.
		await electrumClient.connect();
		// Set up a callback function to handle new blocks.

		// Listen for notifications.
		electrumClient.on('notification', handleNotifications);

		console.log(scripthash);
		// Set up a subscription for new block headers.
		//await electrumClient.subscribe('blockchain.scripthash.transactions.subscribe',[scripthash]);
		await electrumClient.subscribe('blockchain.scripthash.subscribe', scripthash);
		updateUnspent();
	});

	onDestroy(async () => {
		const electrumClient = new ElectrumClient('unspent/drip', '1.4.1', 'bch.imaginary.cash');
		await electrumClient.disconnect();
	});
</script>

<svelte:head>
	<title>Drip Mine</title>
	<meta
		name="description"
		content="Release miner extractable value (MEV) on Bitcoin Cash (BCH) from your browser!"
	/>
</svelte:head>

<section>
	<div class="status">
		{#if connectionStatus == 'CONNECTED'}
			<img src={CONNECTED} alt={connectionStatus} />
		{:else}
			<img src={DISCONNECTED} alt="Disconnected" />
		{/if}
	</div>

	<div class="grid">
		{#each unspent as item, index}
			{#if item.height !== 0}
				<div class="row">
					<button onclick={() => processOutput(item, index)}>
						<img src={blo('0x' + item.tx_hash)} alt={item.tx_hash} />
						<p>{Number(item.value).toLocaleString()}</p>
					</button>
				</div>
				{:else}
				<div class="row">
					<button disabled>
						<img src={blo('0x' + item.tx_hash)} alt={item.tx_hash} />
						<p>{Number(item.value).toLocaleString()}</p>
					</button>
				</div>
			{/if}
		{/each}
	</div>
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

	.grid {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		align-items: flex-start;
	}

	.grid .row {
		justify-content: center;
		align-items: center;
		text-align: center;
		grid-gap: 0.2rem;
		margin: 0 0 0.2rem 0;
	}

	button p {
		font-size: x-small;
		font-weight: 600;
		margin: 0px;
	}
	button:disabled{
		filter: grayscale(100%);
	}
</style>
