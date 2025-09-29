<script>
	import { blo } from 'blo';
	import likesIcon from '$lib/images/likes.svg';

	let showMore = $state(false);
	
    const TRUNCATE = 400;
	let {
		likePost = $bindable(),
		thisAuth,
		hash,
		auth,
		height,
		sequence,
		body,
		likes,
		dislikes,
		ref,
		error
	} = $props();
</script>

<div class="container">
	<div class="auth">
		{#if !thisAuth}
			<img height="32px" src={blo(auth, 16)} alt={auth} />
		{:else}
			<div style="width:32px"></div>
		{/if}
	</div>
	<div class="post {thisAuth ? 'op' : ''} ">
		<div class="footer">
			<div class="fill"></div>
			<div class="action"></div>
		</div>
		{#if !error}
			{#if body.length > TRUNCATE+20  && showMore}
				<div>
					{body}

					<button
						onclick={() => {
							showMore = !showMore;
						}}
					>
						{showMore ? 'show less' : 'show more'}
					</button>
				</div>
			{:else if body.length > TRUNCATE+20 }
				<div>
					{body.substring(0,TRUNCATE) + ' ...'}
					<button
						onclick={() => {
							showMore = !showMore;
						}}
					>
						{showMore ? 'show less' : 'show more'}
					</button>
				</div>
			{:else}
				{body}
			{/if}
		{:else}
			<div class="error">
				{error}
			</div>
		{/if}
		<div class="footer">
			<div class="hash">{hash}</div>
			<div class="fill"></div>

			<div class="actions">
				<button
					onclick={() => {
						likePost(hash);
					}}
				>
					<img height="16px" src={likesIcon} alt="likes" />
					{likes}
				</button>
			</div>
			<div class="timestamp">{height} ■ {sequence}</div>
		</div>
	</div>
	<div class="auth">
		{#if thisAuth}
			<img height="32px" src={blo(auth, 16)} alt={auth} />
		{:else}
			<div style="width:32px"></div>
		{/if}
	</div>
</div>

<style>
	.container {
		display: flex;
		padding: 5px;
	}
	.post {
		border-radius: 10px;
		padding: 5px 5px 5px 15px;
		background-color: #eeeeee;
		margin: auto;
		width: 100%;
		white-space: pre-line;
		word-break: break-word;
	}

	button {
		border-width: 0px;
		background: transparent;
		font-weight: 700;
		color: #ad67c2;
		font-size: small;
	}
	
	.actions {
		margin: auto;
		font-size: x-small;
		font-weight: 400;
		vertical-align: middle;
	}
	.footer {
		display: flex;
	}
	.hash {
		font-size: xx-small;
		font-weight: 200;
		align-content: flex-start;
		color: #857070;
		max-width: 70%;
		word-wrap: anywhere;
	}
	.fill {
		flex: 1;
	}
	.timestamp {
		font-size: xx-small;
		font-weight: 200;
		color: #777;
	}
	.auth {
		align-content: center;
		padding: 5px 5px 5px 5px;
	}
	.auth img {
		border-radius: 20%;
	}

	.post :global {
		p {
			font-weight: 400;
			line-height: 1;
		}
	}

	.post.op {
		background-color: #fff;
	}

	.error {
		color: brown;
	}
</style>
