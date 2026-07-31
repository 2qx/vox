<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
    import { page } from '$app/state';

	import Photon from '@unspent/photon';
	import { ElectrumClient, ConnectionStatus } from '@electrum-cash/network';

	import Readme from './README.md';
	import BitauthLink from '$lib/BitauthLink.svelte';
	import CONNECTED from '$lib/images/connected.svg';
	import DISCONNECTED from '$lib/images/disconnected.svg';

    let unspent: any[] = [];
	let contractState = '';

	let connectionStatus = $state('');
	let electrumClient: any;
	let scripthash = '';
	scripthash = Photon.getScriptHash();
	let server = page.url.hostname == 'vox.cash' ? 'bch.imaginary.cash' : 'chipnet.bch.ninja';

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

    const updateUnspent = async function () {
		let response = await electrumClient.request(
			'blockchain.scripthash.listunspent',
			scripthash,
			'exclude_tokens'
		);
		if (response instanceof Error) throw response;
		unspent = response;
	};


    onMount(async () => {
		// Initialize an electrum client.
		electrumClient = new ElectrumClient(Photon.USER_AGENT, '1.4.1', server);

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
	<title>☀️ ⇒ γ Photons</title>
	<meta name="description" content="Emit Photons Tokens" />
</svelte:head>

<section>
	<div class="status">
		<BitauthLink template={Photon.template} />
		{#if connectionStatus == 'CONNECTED'}
			<img src={CONNECTED} alt={connectionStatus} />
		{:else}
			<img src={DISCONNECTED} alt="Disconnected" />
		{/if}
	</div>

	<h1>Emit photons</h1>

  	<Readme />
</section>

<style>
	.status {
		text-align: end;
	}
</style>
