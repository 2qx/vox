<script lang="ts">
	//import { onMount } from 'svelte';
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

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
