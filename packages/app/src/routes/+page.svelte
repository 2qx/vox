<script lang="ts">
	import { page } from '$app/state';
	const isMainnet = page.url.hostname == 'vox.cash';
	let protocols = [
		{
			name: 'Badger',
			description: 'Token rewards for time-locking BCH.',
			image: '/badger.svg',
			link: '/badger',
			disabled: true
		},
		{
			name: 'BPTS',
			description: 'A zero-timelock savings reward token.',
			image: '/BPTS.svg',
			link: '/bpt',
			disabled: false
		},
		{
			name: 'CatDex',
			description: 'A limit order decentralized exchange.',
			link: '/cat',
			image: '/cat.svg',
			disabled: true
		},
		{
			name: 'Drip',
			description: 'A simple contract for miner extractable value.',
			image: '/drip.svg',
			link: '/drip',
			disabled: false
		},
		{
			name: 'Dutch',
			description: 'Token auction',
			image: '/dutch.svg',
			link: '/dutch',
			disabled: true
		},
		{
			name: 'FBCH',
			description: 'Tokenized timelocked BCH',
			image: '/FBCH.svg',
			link: '/future',
			disabled: true
		},

		{
			name: 'Locktime',
			description: 'Timed vault.',
			image: '/locktime.svg',
			link: '/locktime',
			disabled: true
		},
		{
			name: 'Subscription',
			description: 'Token auto-payments.',
			image: '/subscription.svg',
			disabled: true
		},
		{
			name: 'Timeout',
			description: 'NFT controlled timeout vault.',
			image: '/timeout.svg',
			disabled: true
		},
		{
			name: 'WBCH',
			description: 'Wrapped Bitcoin Cash CashToken.',
			image: '/WBCH.svg',
			link: '/wrap',
			disabled: false
		},
		{
			name: 'Trust',
			description: 'Get one percent of a fund monthly in perpetuity.',
			image: '/unspent.svg',
			disabled: true
		},
		{
			name: 'Vox',
			description: 'Chat app for the future.',
			image: '/vox.svg',
			link: '/pop',
			disabled: !isMainnet
		}
	];
</script>

<svelte:head>
	<title>vox</title>
	<meta name="description" content="vox dot cash" />
</svelte:head>
<h1>Welcome!</h1>
<section>
	<div class="welcome">
		{#each protocols as item}
			<div class="app-button">
				<a href={item.link}>
					<button disabled={item.disabled}>
						<img width="80px" src={item.image} alt={item.description} /><br />
						{item.name}
					</button>
				</a>
			</div>
		{/each}
	</div>
</section>

<style>
	section {
		justify-content: center;
		align-items: center;
		flex: 0.6;
		display: flex;
		padding: 0px;
	}

	h1 {
		width: 100%;
	}

	.welcome {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		align-items: flex-start;
		margin: auto;
	}

	.welcome .app-button {
		justify-content: center;
		text-align: center;
		border-radius: 50%;
		margin: auto;
	}

	.app-button button {
		background-color: transparent;
		background-repeat: no-repeat;
		border: none;
		cursor: pointer;
		overflow: hidden;
		outline: none;
		font-weight: 600;
		font-size: small;
		filter: drop-shadow(8px 8px 16px #ffffff);
		
	}

	.app-button button:disabled {
		filter: grayscale(95%) opacity(60%) blur(2px);
		font-weight: 100;
	}
</style>
