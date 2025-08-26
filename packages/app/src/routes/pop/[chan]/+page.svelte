<script lang="ts">
	import Chat from '$lib/Chat.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let topic = $derived(data.topic)
</script>

<Chat {topic}></Chat>

<style>
</style>