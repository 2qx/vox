<script lang="ts">
	import Wrap from '@unspent/wrap';
	import Readme from './README.md';
	import BitauthLink from '$lib/BitauthLink.svelte';
	import CONNECTED from '$lib/images/connected.svg';
	import DISCONNECTED from '$lib/images/disconnected.svg';
	let connectionStatus = '';
</script>

<section>
	<div class="status">
		{#if connectionStatus == 'CONNECTED'}
			<img src={CONNECTED} alt={connectionStatus} />
		{:else}
			<img src={DISCONNECTED} alt="Disconnected" />
		{/if}
		<BitauthLink template={Wrap.template} />
	</div>
	<p>Wrap Bitcoin Cash as a CashToken</p>

	<Readme />
</section>
