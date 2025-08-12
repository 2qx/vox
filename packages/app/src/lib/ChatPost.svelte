<script>
	import { blo } from 'blo';
	import { marked } from 'marked';

	let { hash, auth, height, sequence, body, likes, dislikes, ref, error } = $props();
</script>

<div class="container">
	<div class="auth">
		<img height="32px" src={blo(auth, 16)} alt={auth} />
	</div>
	<div class="post">
		{#if !error}
			{@html marked(body)}
		{:else}
			{error}
		{/if}
	</div>
    <p></p>
</div>

<style>
	.container {
		display: flex;
        padding: 5px;
	}
	.post {
        border-radius: 10px;
		padding: 5px 5px 5px 15px;
		background-color: #ffffffaa;
		margin: auto;
		width: 100%;
	}

	.auth {
        align-content: center;
		padding: 5px 5px 5px 5px;
	}
	.auth img {
		border-radius: 50%;
	}

    .post :global {
		p { 
            font-weight: 600;
            line-height: 1; 
        }
	}
</style>
