<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/state';
	import type { PageProps } from './$types';

	import { IndexedDBProvider } from '@mainnet-cash/indexeddb-storage';
	import { BaseWallet, Wallet, TestNetWallet } from 'mainnet-js';
	import { ElectrumClient, ConnectionStatus } from '@electrum-cash/network';

	import BCH from '$lib/images/BCH.svg';
	import tBCH from '$lib/images/tBCH.svg';
	import { CashAddressNetworkPrefix } from '@bitauth/libauth';

	import ExplorerLinks from '$lib/ExplorerLinks.svelte';

	import FbchIcon from '$lib/FbchIcon.svelte';
	import Loading from '$lib/Loading.svelte';

	import { Vault, getFutureBlockDate } from '@fbch/lib';
	import { COUPON_SERIES, USER_AGENT } from '@fbch/lib';
	import { TIMELOCK_MAP, TIMELOCK_MAP_CHIPNET } from '@fbch/lib';

	import { cashAddressToLockingBytecode } from '@bitauth/libauth';

	import {
		cashAssemblyToHex,
		getScriptHash,
		getHdPrivateKey,
		sumUtxoValue,
		sumTokenAmounts,
		type UtxoI
	} from '@unspent/tau';

	let { data }: PageProps = $props();
	let time = $state(Number(data.time));

	let now: number = $state(0);

	let key = $state('');
	let coupons: any[] | undefined = $state();
	let electrumClient: any;
	let walletScriptHash = $state('');
	let scripthash = Vault.getScriptHash(time);
	let amount = $state(0n);
	let connectionStatus = $state('');
	let contractState = $state('');
	let timer: any;

	const isMainnet = page.url.hostname == 'vox.cash';
	const prefix = isMainnet ? 'bitcoincash' : ('bchtest' as CashAddressNetworkPrefix);
	const baseTicker = isMainnet ? 'BCH' : 'tBCH';
	const baseSeries = isMainnet ? 'FBCH' : 'tFBCH';
	const server = isMainnet ? 'bch.imaginary.cash' : 'chipnet.bch.ninja';
	const bchIcon = isMainnet ? BCH : tBCH;
    const explorer = isMainnet ? "explorer.bch.ninja" : "chipnet.bch.ninja" 
	const SERIES_MAP = isMainnet ? TIMELOCK_MAP : TIMELOCK_MAP_CHIPNET;

	let transaction_hex = '';
	let transaction: any = $state(undefined);
	let transactionValid = $state(false);
	let sourceOutputs: any = $state();
	let transactionError: string | boolean = $state('');

	let requests: any[] = [];

	let threads: UtxoI[] = $state([]);
	let walletUnspent: UtxoI[] = $state([]);

	let openCouponInterest: number = $state(0);
	let couponTotal: number = $state(0);

	let errorMessage = '';

	let wallet: any;
	let walletBalance: number = $state(0);
	let sumVault: number;
	let sumVaultTokens: bigint;
	let vaultAddress = Vault.getAddress(time, prefix as CashAddressNetworkPrefix);
	let walletError;

	const updateVault = async function () {
		let response = await electrumClient.request(
			'blockchain.scripthash.listunspent',
			scripthash,
			'include_tokens'
		);
		if (response instanceof Error) throw response;


		threads = response.filter((u:UtxoI) => u.token_data?.category == SERIES_MAP.get(time));
		sumVault = sumUtxoValue(threads, true);
		sumVaultTokens = sumTokenAmounts(threads, SERIES_MAP.get(time)!);
	};

	async function updateCoupons() {
		if (electrumClient && now > 1000) {
			coupons = await Vault.getAllCouponUtxos(electrumClient, now, [time]);
		}
		if (coupons) {
			coupons.sort((a: any, b: any) => parseFloat(b.spb) - parseFloat(a.spb));
			openCouponInterest = Number(coupons.reduce((acc, c) => acc + c.placement, 0) / 1e8);
			couponTotal = Number(coupons.reduce((acc, c) => acc + c.value, 0));
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

	function debounce(func: any, timeout = 5000) {
		let timer: any;
		return (...args: any[]) => {
			clearTimeout(timer);
			timer = setTimeout(() => {
				//@ts-ignore
				func.apply(this, args);
			}, timeout);
		};
	}

	async function doSwaps() {
		console.log('processing que data');
		console.log(requests);
		try {
			await Vault.swap();
			errorMessage = '';
		} catch (e: any) {
			errorMessage = e;
			console.log(e.message);
		}
		requests = [];
	}

	const processQueue = debounce(() => doSwaps());

	const handlePlacement = async function (coupon: any, id: string) {
		walletBalance -= coupon.placement;
		requests.push({
			placement: BigInt(coupon.placement),
			coupon: coupon.utxo,
			locktime: coupon.locktime
		});
		console.log(requests);
		coupons = coupons.filter((c) => c.id !== id);
		processQueue();
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
		} else if (data.method === 'blockchain.scripthash.subscribe') {
			// data.params[0]
			// TODO: only update matching utxos
			debounce(updateCoupons);
			debounce(updateWallet);
			debounce(updateVault);
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
		updateVault();
		updateCoupons();
		updateWallet();
	});
</script>

<svelte:head>
	{#if time > 858000}
		<title>{baseSeries}-{time}</title>
		<meta name="description" content="Future Vault Series" />
		<link rel="icon" type="image/svg" href="/FBCH-{time}.svg" />
	{:else}
		<title>{baseSeries}</title>
		<meta name="description" content="Future Vault Series" />
		<link rel="icon" type="image/svg" href="/FBCH.svg" />
	{/if}
</svelte:head>
<section>
	<div class="text-column">
		{#if time}
			<div style="display:flex; flex-direction:column; align-items:flex-end;">
				<h1>Vault {time.toLocaleString()}<sub>■</sub></h1>
				{#if now}
					{#if time - now > 0}
						<h2>T&#8196; -{(time - now).toLocaleString()}<sub>■</sub></h2>
					{/if}
				{/if}
			</div>
			{#if now}
				<p>
					<b>
						{#if time - now >= 2000}
							Unlocking around
							{getFutureBlockDate(now, time).toLocaleDateString()}
						{:else if time - now >= 0}
							Unlocks around
							{getFutureBlockDate(now, time).toLocaleDateString()}
							{getFutureBlockDate(now, time).toLocaleTimeString()}
						{:else if time - now < 0}
							Redemptions are open
						{:else}
							-
						{/if}
					</b>
				</p>
			{/if}
			<p>
				Vault locking Bitcoin Cash ({baseTicker}) for CashTokens until opening redemptions after
				block {time.toLocaleString()}―in
				{(time - now).toLocaleString()} blocks.
			</p>
			<div style="display:flex;">
				<FbchIcon {time} size={75} />
			</div>

			<h4>Spot Coupons</h4>

			<p>
				Coupons discount placement of <i>P</i>
				{baseTicker} into the vault; limit one coupon per transaction.
			</p>

			{#if coupons}
				{#if coupons.length > 0}
					<table class="couponTable">
						<thead>
							<tr class="header">
								<td>{baseTicker}</td>
								<td>coupon</td>
								<td colspan="3">coupon rate </td>

								<td>action</td>
							</tr>
							<tr class="units">
								<td class="r"><img width="15" src={bchIcon} alt="bchLogo" /></td>
								<td class="r">sats</td>
								<td class="r">spb</td>
								<td>per annum</td>
								<td>to maturity</td>
								<td> </td>
							</tr>
						</thead>

						<tbody>
							{#each coupons as c}
								<tr>
									<td class="r">{Number(c.placement / 1e8)}</td>
									<td class="sats">{Number(c.value).toLocaleString()} </td>
									<td class="sats">{c.locale.spb}</td>
									<td class="r">
										<i>{c.locale.ypa}%</i>
									</td>
									<td class="r">
										<i>{c.locale.ytm}%</i>
									</td>
									{#if walletBalance + Number(c.value) > c.placement}
										<td style="text-align:center;"
											><button class="action" on:click={() => handlePlacement(c, c.id)}
												>claim</button
											></td
										>
									{:else}
										<td style="text-align:center;"
											><button class="action" disabled style="font-size:xx-small;">lo bal</button
											></td
										>
									{/if}
								</tr>
							{/each}
							<tr style="border-top: solid thin;">
								<td class="r"><b>{openCouponInterest.toFixed(1)} </b></td>
								<td class="r">
									<b>{couponTotal.toLocaleString()} </b>
								</td>
								<td></td>
								<td></td>
								<td></td>
							</tr>
						</tbody>
					</table>
				{:else}
					<p>no coupons available</p>
				{/if}
			{:else}
				<Loading />
				<p>loading coupons</p>
			{/if}

			<h4>Coupon Contracts</h4>

			<ul class="couponList">
				{#each COUPON_SERIES as c}
					<li>
						C<sub>{c}</sub>
						{Math.pow(10, c)} BCH
						<ExplorerLinks
							address={Vault.getCouponAddress(
								Math.pow(10, c) * 1e8,
								time,
								prefix as CashAddressNetworkPrefix
							)}
							{isMainnet}
						></ExplorerLinks><br />
					</li>
				{/each}
			</ul>

			<h4>Vault Threads</h4>
			<div style="display:flex">
				<ExplorerLinks address={vaultAddress} {isMainnet}></ExplorerLinks>
			</div>
			<p>
				Seven (7) unspent transaction outputs control swapping of coins and tokens on a 1:1 basis
				with the vault unlocking script.
			</p>
			<p class="cashaddr">
				Category/pre-genesis: <a
					target="_blank"
					href={`https://${explorer}/tx/${SERIES_MAP.get(time)}`}
				>
					{SERIES_MAP.get(time)}</a
				>
			</p>

			{#if threads && threads.length}
				<table class="couponTable">
					<thead>
						<tr class="header">
							<td>category </td>
							<td>{baseTicker} </td>
							<td>{baseSeries}-{String(time).padStart(7, '0')} </td>
						</tr>
					</thead>

					<tbody>
						{#each threads as c}
							{#if c.token_data}
								<tr>
									<td
										><i
											>{c.token_data.category.substring(0, 4) +
												'...' +
												c.token_data.category.slice(-2)}</i
										></td
									>
									<td class="r">
										{(Number(c.value) / 1e8).toLocaleString(undefined, {})}
										<img width="15" src={bchIcon} alt="bchLogo" />
									</td>
									<td class="r"
										><i>
											{#if c.token_data}
												{(Number(c.token_data.amount) / 1e8).toLocaleString(undefined, {})}
											{/if}
										</i>
										<FbchIcon {time} size={15} />
									</td>
								</tr>
							{/if}
						{/each}
					</tbody>
				</table>
			{:else}
				<p>loading threads</p>
				<Loading />
			{/if}
			<hr />
			<p style="font-size:small">
				<i>sats (satoshis)</i>: one 100,000,000<sup>th</sup> of a whole coin.<br />
				<i>spb</i>: rate in sats per coin per block of time remaining to maturation.<br />
				<i>coupon rate per annum</i>: effective non-compounding rate of annual return.<br />
				Note: approximate rates assume 870 sats network transaction fees (550 swap, 320 redeem)―paid
				to miners.
			</p>
		{:else}
			<div style="text-align:center">
				<h2>loading</h2>
				<Loading />
			</div>
		{/if}
	</div>
</section>

<style>
	h1 {
		margin: 2px;
	}
	h2 {
		margin: 2px;
	}
	p {
		text-overflow: ellipsis;
		margin: 2px;
	}

	.cashaddr {
		line-break: anywhere;
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

	.couponList {
		display: flex;
		flex-wrap: wrap;
		list-style-type: none;
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
	.sats {
		text-align: right;
		font-weight: 300;
		font-style: italic;
	}

	tbody tr td {
		border: 2px ridge rgba(247, 202, 248, 0.6);
	}
</style>
