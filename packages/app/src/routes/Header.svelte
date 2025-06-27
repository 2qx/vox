<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import logo from '$lib/images/vox.svg';
	import walletIcon from '$lib/images/hot.svg';

	import { IndexedDBProvider } from '@mainnet-cash/indexeddb-storage';
	import { BaseWallet, Wallet } from 'mainnet-js';

	let data;
	let wallet: any;
	let walletError = false;
	let balance: number;


	onMount(async () => {
		try {
			BaseWallet.StorageProvider = IndexedDBProvider;
			wallet = await Wallet.named(`vox-mainnet`);
			balance = await wallet.getBalance('bch');
		} catch (e) {
			walletError = true;
			throw e;
		}
	});
</script>

{#if page.url.hostname.includes('127.0.0.1') || page.url.hostname.includes('localhost')}
	<div class="local">
		This is a local development instance.
	</div>
{:else if page.url.hostname.includes('unspent.dev')}
	<div class="dev">
		This is an <b>unstable</b> development version running on <b>chipnet</b>. Please go to <a href="https://vox.cash">vox.cash</a> instead.
	</div>
{:else}{/if}

<header>
	<div class="corner">
		<a href="/">
			<img src={logo} alt="Vox" />
		</a>
	</div>

	<nav>
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L1,2 C1.5,3 1.5,3 2,3 L2,0 Z" />
		</svg>
		<ul>
			<li aria-current={page.url.pathname === '/about' ? 'page' : undefined}>
				<a href="/about">Help</a>
			</li>
		</ul>
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L0,3 C0.5,3 0.5,3 1,2 L2,0 Z" />
		</svg>
	</nav>
	<div></div>
	<div class="corner wallet">
		{#if wallet}
			{#if walletError}
				⚠️
			{/if}
			<a href="/wallet">
				<img width="30" src={walletIcon} alt="wallet" />
				{#if typeof balance !== 'undefined'}
					{balance} BCH
				{:else}
					0 BCH
				{/if}
			</a>
		{/if}
	</div>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
	}

	.dev {
		background-color: rgb(255, 225, 0);
		font-weight: 900;
		min-height: 50px;
		color: rgb(0, 0, 0);
		text-align: center;
	}

	.local {
		width: 100%;
		background-color: rgb(255, 0, 255);
		font-weight: 900;
		min-height: 50px;
		color: white;
		text-align: center;
	}

	.wallet {
		filter: grayscale(95%) opacity(90%);
		position: fixed;
		right: 0px;
		display: flex;
		align-items: center;
		justify-content: right;
		padding: 10px;
		background-color: #ffffff88;
		border-radius: 15px;
		-moz-border-radius: 15px;
	}

	.wallet a {
		color: black;
		display: flex;
	}

	.wallet a img {
		color: black;
		display: flex;
		padding: 5px;
	}

	.corner {
		height: 3em;
	}

	.corner a {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.corner img {
		width: 2em;
		height: 2em;
		object-fit: contain;
	}

	nav {
		display: flex;
		justify-content: center;
		--background: rgba(255, 255, 255, 0.7);
	}

	svg {
		width: 2em;
		height: 3em;
		display: block;
	}

	path {
		fill: var(--background);
	}

	ul {
		position: relative;
		padding: 0;
		margin: 0;
		height: 3em;
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;
		background: var(--background);
		background-size: contain;
	}

	li {
		position: relative;
		height: 100%;
	}

	li[aria-current='page']::before {
		--size: 6px;
		content: '';
		width: 0;
		height: 0;
		position: absolute;
		top: 0;
		left: calc(50% - var(--size));
		border: var(--size) solid transparent;
		border-top: var(--size) solid var(--color-theme-1);
	}

	nav a {
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 0.5rem;
		color: var(--color-text);
		font-weight: 700;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-decoration: none;
		transition: color 0.2s linear;
	}

	a:hover {
		color: var(--color-theme-1);
	}

	
</style>
