<script lang="ts">
	import { deflate } from 'pako';
	import { utf8ToBin, binToBase64 } from '@bitauth/libauth';
	import bitauthIcon from '$lib/images/bitauth.svg';

	export let template;

	const ideURI = 'https://ide.bitauth.com';

	const base64toBase64Url = (base64: string) => base64.replace(/\+/g, '-').replace(/\//g, '_');
	const stringToUriPayload = (content: string) =>
		base64toBase64Url(binToBase64(deflate(utf8ToBin(content))));
	const payload = stringToUriPayload(JSON.stringify(template));
</script>

<a href="{ideURI}/import-template/{payload}" target="_blank">
	<img src={bitauthIcon} alt="Bitauth Icon" />
</a>

<style>
	a img {
		filter: brightness(10);
	}
</style>
