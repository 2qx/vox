<script lang="ts">
	import Counter from './Counter.svelte';
	import welcome from '$lib/images/svelte-welcome.webp';
	import welcomeFallback from '$lib/images/svelte-welcome.png';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="vox dot cash" />
</svelte:head>

<section>
	<h1>Welcome!</h1>
	<span class="welcome">
		<button></button>
		<button></button>
		<button></button>
		<button></button>
		<button></button>
		<button></button>
		<button></button>
		<button></button>
		<button></button>
	</span>

	<p>More markets, more freedom, more power.</p>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}

	.welcome {
		display: block;
		width: 100%;
		padding: 0 0 calc(100% * 395 / 1048) 0;
	}

	.welcome button {
		height: 80px;
		width: 80px;
		border-radius: 50%;
	}
</style>
