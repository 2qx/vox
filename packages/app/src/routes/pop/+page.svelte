<script lang="ts">
	import Readme from './README.md';
	import type { PageProps } from './$types';
	import Chat from '$lib/Chat.svelte';

	let { data }: PageProps = $props();
</script>
<h1>{data.topic}</h1>

<Chat topic=""></Chat>
<Readme />

<style>

</style>
