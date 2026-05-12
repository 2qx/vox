<script>
	import SvelteMarkdown, {
		allowRenderersOnly,
		buildUnsupportedHTML
	} from '@humanspeak/svelte-markdown';

	// Only allow basic text formatting
	const renderers = {
		...allowRenderersOnly([
			'heading',
			'paragraph',
			'blockquote',
			'code',
			'text',
			'strong',
			'em',
			'list',
			'listitem',
			'hr',
			'br',
			'table',
			'tablehead',
			'tablebody',
			'tablerow',
			'tablecell',
			'codespan',
			'del',
			'orderedlistitem',
			'unorderedlistitem'
		]),
		html: buildUnsupportedHTML()
	};

	let { body } = $props();
</script>

<SvelteMarkdown source={body} {renderers} />
<style>
	.js {
		background-color: grey;
	}
</style>
