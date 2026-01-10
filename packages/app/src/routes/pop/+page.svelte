<script lang="ts">
	import Readme from './README.md';
	import type { PageProps } from './$types';
	import Chat from '$lib/Chat.svelte';
	import ChatPost from '$lib/ChatPost.svelte';

	let { data }: PageProps = $props();
	let topic = $derived(data.topic);
	let postId = $derived(data.postId);
</script>

<svelte:head>
	<title>📣 Vox Pop</title>
	<meta name="description" content="Let your voice be heard." />
</svelte:head>

<section>
	{#if postId}
		You are viewing an archived post
		<ChatPost {postId}></ChatPost>
	{:else}
		<Chat {topic}></Chat>
	{/if}

	<Readme />
</section>

<style>
</style>
