<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/state';

	import SeriesIcon from '$lib/FbchIcon.svelte';
	import Loading from '$lib/Loading.svelte';

	// @ts-ignore
	import Readme from './README.md';

	import BitauthLink from '$lib/BitauthLink.svelte';
	import CONNECTED from '$lib/images/connected.svg';
	import DISCONNECTED from '$lib/images/disconnected.svg';

	import { binToHex, cashAddressToLockingBytecode, encodeTransactionBCH } from '@bitauth/libauth';

	import { ElectrumClient, ConnectionStatus } from '@electrum-cash/network';
	import { BaseWallet, Wallet, TestNetWallet } from 'mainnet-js';

	import { IndexedDBProvider } from '@mainnet-cash/indexeddb-storage';

	import bch from '$lib/images/BCH.svg';
	import { getScriptHash, getHdPrivateKey, sumUtxoValue, sumTokenAmounts } from '@unspent/tau';
	import { Vault, USER_AGENT } from '@fbch/lib';

	let now: number = $state(0);

	let key = $state('');
	let coupons: any[] | undefined = $state();
	let electrumClient: any;
	let walletScriptHash = $state('');
	let amount = $state(0);
	let connectionStatus = $state('');
	let contractState = $state('');

	let unspent: any[] = $state([]);
	let walletUnspent: any[] = $state([]);

	let walletBalance = $state(0);

	const isMainnet = page.url.hostname == 'vox.cash';
	const baseTicker = isMainnet ? 'FBCH' : 'tFBCH';
	const prefix = isMainnet ? 'bitcoincash' : 'bchtest';
	const server = isMainnet ? 'bch.imaginary.cash' : 'chipnet.bch.ninja';

	let wallet: any;

	async function updateCoupons() {
		if (electrumClient && now > 1000) {
			coupons = await Vault.getAllCouponUtxos(electrumClient, now);
		}
	}

	const updateWallet = async function () {
		let response = await electrumClient.request(
			'blockchain.scripthash.listunspent',
			walletScriptHash,
			'include_tokens'
		);
		if (response instanceof Error) throw response;
		let walletUnspentIds = new Set(response.map((utxo: any) => `${utxo.tx_hash}":"${utxo.tx_pos}`));
		if (walletUnspent.length == 0) {
			walletUnspent = response;
		}
		walletBalance = sumUtxoValue(walletUnspent, true);
	};

	const handleNotifications = function (data: any) {
		if (data.method === 'blockchain.headers.subscribe') {
			let d = data.params[0];
			now = d.height;
			updateCoupons();
			updateWallet();
		} else if (data.method === 'blockchain.scripthash.subscribe') {
			if (data.params[1] !== contractState) {
				contractState = data.params[1];
				connectionStatus = ConnectionStatus[electrumClient.status];
				amount = 0;
				// debounceUpdateWallet();
			}
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
		electrumClient = new ElectrumClient(USER_AGENT, '1.4.1', server);

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
		<BitauthLink template={Vault.template} />
		{#if connectionStatus == 'CONNECTED'}
			<img src={CONNECTED} alt={connectionStatus} />
		{:else}
			<img src={DISCONNECTED} alt="Disconnected" />
		{/if}
	</div>

	{#if coupons}
		{#if coupons.length > 0}
			<table class="couponTable">
				<thead>
					<tr class="header">
						<td>BCH</td>
						<td colspan="2">FBCH</td>
						<td colspan="2">Coupon </td>
						<td>Matures</td>
						<td>Action</td>
					</tr>
					<tr class="units">
						<td><img width="15" src={bch} alt="bchLogo" /></td>
						<td></td>
						<td>series</td>
						<td class="r">sats</td>
						<td>apy</td>
						<td> </td>
						<td> </td>
					</tr>
				</thead>

				<tbody>
					{#each coupons as c}
						<tr>
							<td class="r">{Number(c.placement / 1e8)}</td>
							<td class="r"><SeriesIcon time={c.locktime} size={15} /></td>
							<td>
								<a style="color:#75006b; font-weight:600;" href="/v?block={c.locktime}"
									>{String(c.locktime).padStart(7, '0')}</a
								>
							</td>

							<td class="sats">{Number(c.value / 1000).toLocaleString()}k </td>
							<td class="r">
								<i>{c.locale.ypa}%</i>
							</td>
							<td class="tiny">{c.dateLocale}</td>
							<!-- {#if walletBalance + Number(c.value) > c.placement}
								<td style="text-align:center;"
									><button class="action" on:click={() => handlePlacement(c, c.id)}>claim</button
									></td
								>
							{:else}
								<td style="text-align:center;"
									><button class="action" disabled style="font-size:xx-small;">lo bal</button></td
								>
							{/if} -->
							<td></td>
						</tr>
					{/each}
					<!-- <tr style="border-top: solid thin;">
							<td>∑</td>
							<td class="r"><b>{openCouponInterest.toFixed(0)} </b></td>
							<td class="r">
								<b>{couponTotal.toLocaleString()} </b>
							</td>
							<td></td>
							<td></td>
							<td></td>
						</tr> -->
				</tbody>
			</table>
			<hr />
			<p style="font-size:small">
				<i>sats (satoshis)</i>: one 100,000,000<sup>th</sup> of a whole coin.<br />
				<i>spb</i>: rate in sats per coin per block of time remaining to maturation.<br />
				<i>apy, coupon rate per annum</i>: effective non-compounding rate of annual return. Note:
				approximate rates assume 870 sats network transaction fees (550 swap, 320 redeem)―paid to
				miners.
			</p>
		{:else}
			<p>no coupons available</p>
		{/if}
	{:else}
		<div style="text-align:center">
			<h2>loading coupons</h2>
			<Loading />
		</div>
	{/if}
	<Readme />
</section>

<style>
	.status {
		text-align: end;
	}

	.couponTable {
		width: 100%;
		border-collapse: collapse;
	}
	thead tr td {
		border: 2px ridge rgba(247, 202, 248, 0.6);
		background-color: #ffffff5b;
	}

	thead tr:nth-child(odd) {
		text-align: center;
		font-weight: 900;
		font-size: small;
	}

	.action {
		display: inline-block;
		border-radius: 10px;
		background-color: #fa1ad5;
		color: #fff;
		margin: 1px;
		padding: 0 5px 0 5px;
		font-weight: 900;
		font-size: small;
	}

	.action:disabled {
		display: inline-block;
		border-radius: 10px;
		background-color: #80748069;
		color: #ffffff;
		margin: 1px;
		padding: 0 5px 0 5px;
		font-weight: 900;
		font-size: small;
	}

	.units {
		text-align: center;
		font-style: italic;
		font-weight: 200;
	}
	tbody tr:nth-child(odd) {
		background-color: #ff33cc1f;
	}
	tbody tr:nth-child(even) {
		background-color: #e495e41a;
	}
	.r {
		text-align: right;
	}
	.tiny {
		font-weight: 100;
		font-size: small;
		text-align: right;
	}
	.sats {
		text-align: right;
		font-weight: 300;
		font-style: italic;
	}

	tbody tr td {
		border: 2px ridge rgba(247, 202, 248, 0.6);
	}
</style>
