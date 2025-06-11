<script lang="ts">
	let protocols = [
		{
			name: 'Badger',
			description: 'Token rewards for time-locking BCH.',
			image: '/badger.svg',
			link: '/badger',
			disabled: true
		},
		{
			name: 'Block Points',
			description: 'A zero-timelock savings reward token.',
			image: '/BPT.svg',
			link: '/bpt',
			disabled: true
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
			name: 'Future BCH',
			description: 'Tokenized timelocked BCH',
			image: '/FBCH.svg',
			link: '/future',
			disabled: true
		},

		{
			name: 'Locktime',
			description: 'Timed asset vault.',
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
			name: 'Wrapped BCH',
			description: 'Wrapped Bitcoin Cash CashToken.',
			image: '/WBCH.svg',
			disabled: true
		},
		{
			name: 'Trust',
			description: 'Get one percent of a fund monthly in perpetuity.',
			image: '/unspent.svg',
			disabled: true
		},
		{
			name: 'Vox',
			description: 'Text-chat.',
			image: '/vox.svg',
			disabled: true
		}
	];
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="vox dot cash" />
</svelte:head>

<section>
	<h1>Welcome!</h1>
	<div class="welcome">
		{#each protocols as item}
			<div class="app-button">
				{#if item.disabled}
					<button disabled>
						<img width="80px" src={item.image} alt={item.description} /><br />
						{item.name}
					</button>
				{:else}
					<a href={item.link}>
						<button>
							<img width="80px" src={item.image} alt={item.description} /><br />
							{item.name}
						</button>
					</a>
				{/if}
			</div>
		{/each}
	</div>

	<p>More markets, more freedom, more power.</p>
</section>

<style>
	section {
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}

	.welcome {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		width: 100%;
		padding: 0 0 calc(100% * 395 / 1048) 0;
	}

	.welcome .app-button {
		justify-content: center;
		align-items: center;
		text-align: center;
		padding: 10%;
		border-radius: 50%;
	}

	.app-button button:disabled {
		filter: grayscale(100%);
	}
</style>
