<script lang="ts">
	import Readme from './README.md';

	import BitauthLink from '$lib/BitauthLink.svelte';
	import CONNECTED from '$lib/images/connected.svg';
	import DISCONNECTED from '$lib/images/disconnected.svg';

	import Timeout from '@unspent/timeout';

	let connectionStatus = $state('');
</script>

<section>
	<div class="status">
		<BitauthLink template={Timeout.template} />
		{#if connectionStatus == 'CONNECTED'}
			<img src={CONNECTED} alt={connectionStatus} />
		{:else}
			<img src={DISCONNECTED} alt="Disconnected" />
		{/if}
	</div>

	<Readme />
</section>

<style>
	.status {
		text-align: end;
	}
</style>
