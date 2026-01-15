<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	import Loading from '$lib/Loading.svelte';

	// @ts-ignore
	import Readme from './README.md';

	import BitauthLink from '$lib/BitauthLink.svelte';
	import CONNECTED from '$lib/images/connected.svg';
	import DISCONNECTED from '$lib/images/disconnected.svg';
	import FutureCoupon from '$lib/FutureCoupon.svelte';

	import {
		binToHex,
		cashAddressToLockingBytecode,
		encodeTransactionBch,
		stringify
	} from '@bitauth/libauth';

	import { ElectrumClient, ConnectionStatus } from '@electrum-cash/network';
	import { BaseWallet, Wallet, TestNetWallet } from 'mainnet-js';

	import { IndexedDBProvider } from '@mainnet-cash/indexeddb-storage';

	import { getScriptHash, getHdPrivateKey, sumUtxoValue, type UtxoI, sleep } from '@unspent/tau';
	import { Vault, USER_AGENT, type CouponItemI } from '@fbch/lib';
	import { TIMELOCK_MAP, TIMELOCK_MAP_CHIPNET } from '@fbch/lib';

	import BCH from '$lib/images/BCH.svg';
	import tBCH from '$lib/images/tBCH.svg';

	let now: number = $state(0);

	let key = $state('');
	let coupons: any[] | undefined = $state.raw();
	let electrumClient: any;
	let timer: any;
	let couponGrouped: Map<string, CouponItemI[]> | undefined = $state();
	let walletScriptHash = $state('');
	let amount = $state(0);
	let openCouponInterest = $state(0);
	let couponTotal = $state(0);
	let connectionStatus = $state('');
	let contractState = $state('');

	let walletUnspent: any[] = $state.raw([]);
	let broadcastQueue: string[] = $state([]);
	let vaultCache: Map<number, UtxoI[]> = new Map([]);
	let walletBalance = $state(0);

	const isMainnet = page.url.hostname == 'vox.cash';
	const ticker = isMainnet ? 'BCH' : 'tBCH';
	const baseTicker = isMainnet ? 'FBCH' : 'tFBCH';
	const prefix = isMainnet ? 'bitcoincash' : 'bchtest';
	const server = isMainnet ? 'bch.imaginary.cash' : 'chipnet.bch.ninja';
	const SERIES_MAP = isMainnet ? TIMELOCK_MAP : TIMELOCK_MAP_CHIPNET;
	const bchIcon = isMainnet ? BCH : tBCH;

	let wallet: any;
	let disableUi = false;

	
	const debounceUpdateWallet = () => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			updateWallet();
			updateCoupons();
		}, 5000);
	};

	const debounceBroadcastQue = async () => {
		clearTimeout(timer);
		timer = setTimeout(async () => {
			while (broadcastQueue.length) {
				let tx = broadcastQueue.shift()!;
				try {
					await broadcast(tx);
					await sleep(400);
					console.log('broadcast');
				} catch (e) {
					// if one transaction failed, the whole chain is borked,
					// start over.
					console.error(e);
					broadcastQueue = [];
					walletUnspent = [];
					vaultCache = new Map([]);
					debounceUpdateWallet();
				}
			}
		}, 500);
	};

	async function handlePlacement(coupon: any) {
		if (!vaultCache.has(coupon.locktime)) {
			vaultCache.set(
				coupon.locktime,
				await electrumClient.request(
					'blockchain.scripthash.listunspent',
					Vault.getScriptHash(coupon.locktime),
					'include_tokens'
				)
			);
		}

		// filter out junk Utxos in vault.
		let vaultUtxos = vaultCache
			.get(coupon.locktime)!
			.filter((u) => u.token_data?.category == SERIES_MAP.get(coupon.locktime));

		let swapTx = Vault.swap(
			coupon.placement,
			vaultUtxos,
			walletUnspent,
			coupon.locktime,
			key,
			coupon
		);

		let transactionHex = binToHex(encodeTransactionBch(swapTx.transaction));
		broadcastQueue.push(transactionHex);
		debounceBroadcastQue();

		coupons = coupons?.filter((c) => !(c.tx_hash == coupon.tx_hash && c.tx_pos == coupon.tx_pos));
		couponGrouped = Map.groupBy(
			coupons!,
			({ locktime, placement, value }) => `${locktime}-${placement}-${value}`
		);
		walletUnspent = swapTx.walletUtxos;
		vaultCache.set(coupon.locktime, swapTx.contractUtxos);
		walletBalance -= coupon.placement
	}

	const broadcast = async function (raw_tx: string) {
		let response = await electrumClient.request('blockchain.transaction.broadcast', raw_tx);
		if (response instanceof Error) {
			connectionStatus = ConnectionStatus[electrumClient.status];
			throw response;
		}
		response as any[];
	};

	async function updateCoupons() {
		if (electrumClient && now > 1000) {
			coupons = await Vault.getAllCouponUtxos(electrumClient, now);
		}
		if (coupons) {
			couponGrouped = Map.groupBy(
				coupons,
				({ locktime, placement, value }) => `${locktime}-${placement}-${value}`
			);

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

		walletUnspent = response.filter((u: UtxoI) => !u.token_data?.nft);
		walletBalance = sumUtxoValue(walletUnspent, true);
	};

	const handleNotifications = function (data: any) {
		connectionStatus = ConnectionStatus[electrumClient.status];
		if (data.method === 'blockchain.headers.subscribe') {
			let d = data.params[0];
			now = d.height;
			debounceUpdateWallet();
		} else if (data.method === 'blockchain.scripthash.subscribe') {
			if (data.params[1] !== contractState) {
				contractState = data.params[1];
				amount = 0;
				debounceUpdateWallet();
			}
		} else {
			console.log(data);
		}
	};

	onMount(async () => {
		BaseWallet.StorageProvider = IndexedDBProvider;
		wallet = isMainnet ? await Wallet.named(`vox`) : await TestNetWallet.named(`vox`);

		key = getHdPrivateKey(wallet.mnemonic!, wallet.derivationPath.slice(0, -2), wallet.isTestnet);
		let lockingBytecodeResult = cashAddressToLockingBytecode(wallet.getDepositAddress());
		if (typeof lockingBytecodeResult == 'string') throw lockingBytecodeResult;
		walletScriptHash = getScriptHash(lockingBytecodeResult.bytecode);

		// Initialize an electrum client.
		electrumClient = new ElectrumClient(USER_AGENT, '1.4.1', server);

		// Wait for the client to connect.
		await electrumClient.connect();
		// Set up a callback function to handle new blocks.

		// Listen for notifications.
		electrumClient.on('notification', handleNotifications);

		// Set up a subscription for new block headers.
		await electrumClient.subscribe('blockchain.headers.subscribe');
		await electrumClient.subscribe('blockchain.scripthash.subscribe', walletScriptHash);
		updateWallet();
		updateCoupons();
	});
</script>

<svelte:head>
	<title>🅵​ BCH</title>
	<meta name="description" content="Swap coins for Futures." />
</svelte:head>

<section>
	<div class="status">
		{now.toLocaleString()}
		<BitauthLink template={Vault.template} />
		{#if connectionStatus == 'CONNECTED'}
			<img src={CONNECTED} alt={connectionStatus} />
		{:else}
			<img src={DISCONNECTED} alt="Disconnected" />
		{/if}
	</div>

	<h1>Stake coins for futures</h1>

	<div class="swap">
		<div>
			{Number(walletBalance / 100_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}
			{ticker} <img width="20" src={bchIcon} alt={ticker} />
		</div>
	</div>

	{#if couponGrouped}
		{#if couponGrouped.size > 0}
			{#each couponGrouped.values() as subList}
				{#each subList as c, i}
					{#if i == 0}
						<FutureCoupon
							{handlePlacement}
							{...c}
							{isMainnet}
							couponCount={subList.length}
							balance={walletBalance}
						/>
					{/if}
				{/each}
			{/each}
		{:else}
			<p>no coupons available</p>
		{/if}
	{:else}
		<div style="text-align:center">
			<h2>loading coupons</h2>
			<Loading />
		</div>
	{/if}
	<div>
		<p style="font-size:small">
			<i>sats (satoshis)</i>: one 100,000,000<sup>th</sup> of a whole coin.<br />
			<i>spb</i>: rate in sats per coin per block of time remaining to maturation.<br />
			<i>apy, coupon rate per annum</i>: effective non-compounding rate of annual return. Note:
			approximate rates assume 870 sats network transaction fees (550 swap, 320 redeem)―paid to
			miners.
		</p>
	</div>
	<Readme />
</section>

<style>
	.status {
		text-align: end;
		color: #ffffff;
		font-weight: 600;
	}

	.swap {
		display: flex;
		margin: auto;
		align-items: center;
		justify-content: center;
	}
	.swap div {
		font-size: x-large;
	}
</style>
