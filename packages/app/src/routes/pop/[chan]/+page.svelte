<script lang="ts">
	import Chat from '$lib/Chat.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>
<Chat topic={data.topic}></Chat>
<style>
	/* main {
		height: 100%;
		margin: 0;
	} */
</style>