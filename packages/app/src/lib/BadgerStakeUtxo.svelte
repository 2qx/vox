<script lang="ts">
	import { blo } from 'blo';
	import bch from '$lib/images/BCH.svg';
	import icon from '$lib/images/BADGER.svg';

	import { disassembleBytecodeBCH, hexToBin } from '@bitauth/libauth';

	import TokenNftData from './TokenNftData.svelte';
	import TokenAmount from './TokenAmount.svelte';
	import TokenIcon from './TokenIcon.svelte';

	let {
		tx_pos,
		tx_hash,
		height,
		value,
		token_data,
		unlock = $bindable(),
		amount,
		stake,
		user_pkh,
		now
	} = $props();

	let hasMatured = $derived(height + stake < now);
</script>

<div class="container">
	<div class="stake">
		<div class="balance">
			<div class="fill">
				{#if token_data}
					<div>
						<TokenAmount amount={token_data.amount} category={token_data.category} />

						<TokenIcon size="20" category={token_data.category}></TokenIcon>
					</div>
				{/if}
			</div>
			<div>
				<div>
					{Number(value / 100000000).toLocaleString(undefined, {})} <b>BCH</b>
					<img width="20px" src={bch} />
				</div>
				<div class="auth">
					{#if hasMatured}
						<button
							onclick={() => {
								unlock({
									tx_hash: tx_hash,
									tx_pos: tx_pos,
									value: value,
									token_data: token_data
								});
							}}
						>
							release
						</button>
					{/if}
					{#if user_pkh}
						<img height="32px" src={blo(user_pkh, 16)} alt={user_pkh} />
					{/if}
				</div>
			</div>
		</div>
		<div class="header">
			<div class="timestamp">{stake}</div>
			<div class="fill"></div>
			<div class="timestamp">{height}</div>
		</div>
	</div>
</div>

<style>
	.container {
		display: flex;
		padding: 5px;
	}
	.stake {
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
	}
	.hash {
		font-size: xx-small;
		font-weight: 200;
		align-content: flex-start;
		color: #857070;
		max-width: 70%;
		word-break: break-all;
	}
	.fill {
		flex: 1;
		word-break: break-all;
	}
	.fill div {
	}
	.fill div p {
		text-align: right;
	}
	.timestamp {
		font-size: xx-small;
		font-weight: 200;
		color: #777;
		word-break: break-all;
		max-width: 80px;
	}
	.auth {
		align-content: center;
		padding: 5px 5px 5px 5px;
	}
	.auth img {
		border-radius: 25%;
	}

	.stake :global {
		p {
			font-weight: 400;
			line-height: 1;
		}
	}

	.stake.op {
		background-color: #fff;
	}

	.error {
		color: brown;
	}
</style>
