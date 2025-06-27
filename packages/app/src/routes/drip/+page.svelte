<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/state';

	import { encodeTransactionBCH, binToHex, swapEndianness, hash256 } from '@bitauth/libauth';
	import Readme from './README.md';

	import { blo } from 'blo';
	// Import library features.
	import { ElectrumClient, ConnectionStatus } from '@electrum-cash/network';
	import { Drip } from '@unspent/drip';

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

	const processOutput = async function (utxo: any, index: number) {
		let txn = Drip.processOutpoint(utxo);
		spent.add(`${utxo.tx_hash}":"${utxo.tx_pos}`);
		debounceClearSpent();
		let raw_tx = binToHex(encodeTransactionBCH(txn));
		let new_id = swapEndianness(binToHex(hash256(encodeTransactionBCH(txn))));

		let outValue = Number(txn.outputs[0].valueSatoshis);
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
		await broadcast(raw_tx);
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
		electrumClient = new ElectrumClient('unspent/drip', '1.4.1', server);

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
		const electrumClient = new ElectrumClient('unspent/drip', '1.4.1', server);
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
		<BitauthLink template={Drip.template} />
	</div>
	<p>Release miner extractable value (MEV) on Bitcoin Cash (BCH) from your browser!</p>
	<h3>Unspent Transaction Outputs (utxos)</h3>
	<div class="grid">
		{#if unspent.filter((i: any) => i.height > 0).length > 0}
			{#each unspent.filter((i: any) => i.height > 0) as item, index}
				<div class="row">
					<button onclick={() => processOutput(item, index)}>
						<img src={blo('0x' + item.tx_hash)} alt={item.tx_hash} />
						<p>{Number(item.value).toLocaleString()}</p>
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
						<img src={blo('0x' + item.tx_hash)} alt={item.tx_hash} />
						<p>{Number(item.value).toLocaleString()}</p>
					</button>
				</div>
			{/each}
		{:else}
			<p>No pending transactions</p>
		{/if}
	</div>

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
		<img src={dripIcon} slot="icon" />
	</qr-code>
	<p>{Drip.getAddress(prefix)}</p>
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
	button:disabled {
		filter: grayscale(100%);
	}
</style>
