<script lang="ts">
	import { blo } from 'blo';
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/state';

	import { binToHex, cashAddressToLockingBytecode, encodeTransactionBch } from '@bitauth/libauth';

	import { ElectrumClient, ConnectionStatus } from '@electrum-cash/network';

	import { IndexedDBProvider } from '@mainnet-cash/indexeddb-storage';
	import { BaseWallet, Wallet, TestNetWallet } from 'mainnet-js';

	import {
		cashAssemblyToHex,
		getScriptHash,
		getHdPrivateKey,
		sumUtxoValue,
		sumTokenAmounts,
		type UtxoI,
		sleep
	} from '@unspent/tau';

	import BCH from '$lib/images/BCH.svg';
	import tBCH from '$lib/images/tBCH.svg';
	import unspentIcon from '$lib/images/unspent.svg';

	import Readme from './README.md';

	import RangeSlider from '$lib/RangeSlider.svelte';
	import BitauthLink from '$lib/BitauthLink.svelte';
	import CONNECTED from '$lib/images/connected.svg';
	import DISCONNECTED from '$lib/images/disconnected.svg';

	import Trust from '@unspent/trust';

	let electrumClient: any;
	let walletScriptHash = $state('');
	let now: number = $state(0);
	let connectionStatus = $state('');
	let contractState = $state('');

	let key = $state('');
	let amount = $state(0);
	let wallet: any;
	let transactionError: string | boolean = $state('');
	let scripthash = $state('');
	let recipient: Uint8Array = $state(new Uint8Array());

	let timer: any = 0;

	let sumWallet = $state(0);
	let sumVault = $state(0);

	let unspent: any[] = $state([]);
	let walletUnspent: any[] = $state([]);
	let authBaton: any = $state();
	let balance = $state(0);
	let stakeValue = $state(0);

	const isMainnet = page.url.hostname == 'vox.cash';
	const server = isMainnet ? 'bch.imaginary.cash' : 'chipnet.bch.ninja';
	const baseTicker = isMainnet ? 'BCH' : 'tBCH';
	const bchIcon = isMainnet ? BCH : tBCH;
	const relayFee = isMainnet ? 1 : 10;
	const ticker = isMainnet ? 'BCH' : 'tBCH';

	const handleNotifications = async function (data: any) {
		if (data.method === 'blockchain.headers.subscribe') {
			let d = data.params[0];
			debounceUpdateWallet();
			now = d.height;
		} else if (data.method === 'blockchain.scripthash.subscribe') {
			if (data.params[1] !== contractState) {
				contractState = data.params[1];
				connectionStatus = ConnectionStatus[electrumClient.status];
				amount = 0;
				debounceUpdateWallet();
			}
		} else {
			console.log(data);
		}
	};

	const debounceUpdateWallet = () => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			updateWallet();
			updateUnspent();
		}, 1500);
	};

	const updateWallet = async function () {
		let response = await electrumClient.request(
			'blockchain.scripthash.listunspent',
			walletScriptHash,
			'include_tokens'
		);
		if (response instanceof Error) throw response;

		walletUnspent = response;
		balance = sumUtxoValue(walletUnspent, true);

		authBaton = walletUnspent
			.filter((u: UtxoI) => u.token_data)
			.filter((u: UtxoI) => u.token_data?.nft)
			.filter((u: UtxoI) => u.token_data?.nft?.commitment! == binToHex(Trust.getLockingBytecode({ recipient: recipient })))

		walletUnspent = walletUnspent
			.filter((u: UtxoI) => !u.token_data)
			.filter((u: UtxoI) => u.height > 0);
	};

	const updateUnspent = async function () {
		let response = await electrumClient.request('blockchain.scripthash.listunspent', scripthash);
		if (response instanceof Error) throw response;
		// let unspentIds = new Set(response.map((utxo: any) => `${utxo.tx_hash}":"${utxo.tx_pos}`));
		unspent = response;
		unspent.sort((a, b) => a.height - b.height);
		sumVault = sumUtxoValue(unspent, true);
	};

	const broadcast = async function (raw_tx: string) {
		let response = await electrumClient.request('blockchain.transaction.broadcast', raw_tx);
		if (response instanceof Error) {
			connectionStatus = ConnectionStatus[electrumClient.status];
			throw response;
		}
		response as any[];
	};

	const unlock = async function (now: number, utxo: UtxoI) {
		let job = {
			record: Trust.getLockingBytecode({ recipient: recipient }),
			utxo: utxo
		};
		let unlockResponse = Trust.execute([job], now, wallet.getDepositAddress(), relayFee);
		let raw_tx = binToHex(encodeTransactionBch(unlockResponse.transaction));
		console.log(raw_tx);
		await broadcast(raw_tx);
	};

	const lock = async function () {
		console.log('stake value:', stakeValue);
		console.log('balance:', balance);
		console.log('unspent:', walletUnspent);
		if (stakeValue && stakeValue > 50_000) {
			let lockResponse = Trust.fund(
				Math.floor(stakeValue),
				recipient,
				$state.snapshot(walletUnspent),
				key,
				relayFee
			);
			let raw_tx = binToHex(encodeTransactionBch(lockResponse.transaction));
			await broadcast(raw_tx);
		}
	};

	onMount(async () => {
		BaseWallet.StorageProvider = IndexedDBProvider;
		wallet = isMainnet ? await Wallet.named(`vox`) : await TestNetWallet.named(`vox`);

		key = getHdPrivateKey(wallet.mnemonic!, wallet.derivationPath.slice(0, -2), wallet.isTestnet);
		let lockingCodeResult = cashAddressToLockingBytecode(wallet.getDepositAddress());
		if (typeof lockingCodeResult == 'string') throw lockingCodeResult;
		walletScriptHash = getScriptHash(lockingCodeResult.bytecode);
		recipient = lockingCodeResult.bytecode;
		let record = Trust.getLockingBytecode({ recipient: recipient });
		scripthash = Trust.getScriptHash(record);

		// Initialize an electrum client.
		electrumClient = new ElectrumClient(Trust.USER_AGENT, '1.4.1', server);

		// Wait for the client to connect.
		await electrumClient.connect();
		// Set up a callback function to handle new blocks.

		// Listen for notifications.
		electrumClient.on('notification', handleNotifications);

		// Set up a subscription for new block headers.
		await electrumClient.subscribe('blockchain.scripthash.subscribe', scripthash);
		await electrumClient.subscribe('blockchain.scripthash.subscribe', walletScriptHash);
		await electrumClient.subscribe('blockchain.headers.subscribe');
	});

	onDestroy(async () => {
		const electrumClient = new ElectrumClient(Trust.USER_AGENT, '1.4.1', server);
		await electrumClient.disconnect();
	});
</script>

<section>
	<div class="status">
		<BitauthLink template={Trust.template} />
		{#if connectionStatus == 'CONNECTED'}
			<img src={CONNECTED} alt={connectionStatus} />
		{:else}
			<img src={DISCONNECTED} alt="Disconnected" />
		{/if}
	</div>
	{#if connectionStatus == 'CONNECTED'}
		<div class="swap">
			<div class="stakeForm">
				<div class="purple-theme">
					<label for="stakeValue">{baseTicker} to Lock</label>
					<RangeSlider
						bind:value={stakeValue}
						id="stakeValue"
						float={true}
						min={0}
						step={100_000}
						formatter={(v) => `${v / 100_000_000} BCH`}
						max={balance - 3_000}
					/>
					{stakeValue! / 100_000_000}
					{baseTicker}
				</div>
			</div>
			<div class="stake">
				{#if stakeValue! / 100_000_000}
					<button
						onclick={() => {
							lock();
						}}
					>
						stake
					</button>
				{:else}
					<button disabled> stake </button>
					<br />
					<span style="font-size:large; color: red;"></span>
				{/if}
			</div>
		</div>

		{transactionError}

		<!-- {#if authBaton} -->
		{#if unspent.length > 0}
			<h4>Your irrevocable trusts:</h4>
			<div class="grid">
				{#each unspent as t, i}
					{#if !t.token_data && unspent[i]}
						<div class="container">
							<div class="post">
								<div class="balance">
									<div>
										<b>Trust</b>
										<br />
										
										<img src={unspentIcon} width="48px" />
									</div>
									<div class="fill">
										<div></div>
									</div>
									<div class="end">
										<span style="font-size:large"
											>{Number(unspent[i].value).toLocaleString(undefined, {})} sats</span
										>
										<br />
										{#if unspent[i].height > 0 && unspent[i].height - now >= Trust.PERIOD}
											<button class="action" onclick={() => unlock(now, unspent[i])}
												>{t.value / 100_000_000}
												{baseTicker}
												<img height="40px" src={bchIcon} />
											</button>
										{:else}
											<button class="action" disabled
												>unlock in <br />
												<span style="font-weight:600"
													>{unspent[i].height > 0
														? Trust.PERIOD - (now- unspent[i].height)
														: Trust.PERIOD}</span
												>
												Blocks
											</button>
										{/if}
									</div>
								</div>
								<div class="header">
									<div class="timestamp">
										<img
											height={20}
											src={blo(`${unspent[i].tx_hash}:${unspent[i].tx_pos}`, 20)}
										/> {unspent[i].tx_hash} : {unspent[i].tx_pos}
									</div>
									<div class="fill"></div>
									<div class="timestamp">{unspent[i].height}</div>
								</div>
							</div>
						</div>
					{/if}
				{/each}
			</div>
		{:else}
			<div class="swap">
				<p>No trusts for this wallet.</p>
			</div>
		{/if}
		<!-- {:else}
		<p><b>Unspent trusts are irrevocable.</b></p>
		{/if} -->
	{:else}
		<div class="swap">
			<p>Not connected.</p>
		</div>
	{/if}
	<Readme />
</section>

<style>
	.status {
		text-align: end;
	}
	.container {
		display: flex;
		padding: 2px;
	}
	.post {
		border-radius: 10px;
		padding: 5px 5px 5px 15px;
		background-color: #eeeeee;
		margin: auto;
		width: 100%;
		border: #bbb solid;
		border-width: 1px;
	}

	.header {
		display: flex;
	}
	.balance {
		display: flex;
	}
	.balance div {
		padding: 2px;
	}

	.fill {
		flex: 1;
		word-break: break-all;
		display: flex;
		flex-direction: column;
	}
	.timestamp {
		font-size: xx-small;
		font-weight: 200;
		color: #777;
		word-break: break-all;
	}

	.end {
		text-align: end;
	}

	.post :global {
		p {
			font-weight: 400;
			line-height: 1;
		}
	}

	button {
		background-color: #a45eb6; /* Green */
		border: none;
		color: white;
		padding: 12px;
		border-radius: 20px;
		text-align: center;
		text-decoration: none;
		display: inline-block;
		font-size: 16px;
	}

	button:disabled {
		color: #ddd;
		background-color: #777;
	}
</style>
