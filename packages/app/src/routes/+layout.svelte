<script lang="ts">
	//import { onMount } from 'svelte';

	import { assets } from '$app/paths';
	import { page } from '$app/state';
	import Header from './Header.svelte';
	import '../app.css';

	// import type { PostMessage, PostMessageDataRequest, PostMessageDataResponse }  from '$lib/post-message';
	// let sharedWorker: SharedWorker | undefined = undefined;

	// const onWorkerMessage = ({
	// 	data: { msg, data }
	// }: MessageEvent<PostMessage<PostMessageDataResponse>>) => {
	// 	console.log(msg, data);
	// };

	// const loadWorker = async () => {
	// 	const SharedWorker = await import('$lib/worker?sharedworker');
	// 	sharedWorker = new SharedWorker.default();

	// 	sharedWorker.port.onmessage = onWorkerMessage;

	// 	const message: PostMessage<PostMessageDataRequest> = {
	// 		msg: 'request1',
	// 		data: { text: 'Hello World v2 🤪' }
	// 	};
	// 	sharedWorker.port.postMessage(message);
	// };

	// onMount(loadWorker);

	let { children } = $props();
</script>

<div class="app">
	<Header />

	<main>
		{@render children()}
	</main>

	<footer>
		<p>More markets, more freedom, more power.</p>
		<p><a href="https://github.com/2qx/vox" target="_blank">Open source</a></p>
	</footer>

	{#if page.url.hostname.includes('127.0.0.1') || page.url.hostname.includes('localhost')}
		<div class="uc-local">
			<img src="{assets}/dev/localhost.png" alt="local" />
		</div>
	{/if}

	{#if page.url.hostname.includes('unspent.dev')}
		<div class="uc-image">
			<img src="{assets}/dev/under_construction.gif" alt="Whao!" />
		</div>
	{/if}
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 40rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	.uc-image {
		align-self: center;
		width: 60%;
	}
	.uc-local {
		position: fixed;
		top: 5em;
		z-index: 1;
		width: 120px;
		pointer-events: none;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
