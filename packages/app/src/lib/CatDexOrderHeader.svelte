<script lang="ts">
	let {} = $props();
</script>

<div class={['container']}>
	<div class="post">
		<div class="balance">
			<div class="order">
				<div class="auth"></div>
				<div class="price">price</div>
				<div class="price">qty</div>
				<div class="auth"></div>
			</div>
		</div>
		<div class="balance">
			<div class="order">
				<div class="auth"></div>
				<div class="quantity">(sats/token)</div>
				<div class="quantity">(tokens)</div>
				<div class="auth"></div>
			</div>
		</div>
	</div>
</div>

<style>
	.container {
		background-color: #f3d9f5;
		border-radius: 10px;
		display: flex;
	}
	.post {
		border-radius: 10px;
		padding: 0px;
		background-color: #ffffffdd;
		margin: auto;
		width: 100%;
		border: #bbb solid;
		border-width: 1px;
	}

	.bid {
		background-color: #9ef79e;
	}

	.quantity {
		white-space: pre-wrap;
		font-size: small;
		font-weight: 500;
		text-align: end;
	}
	.price {
		min-width: 40px;
		font-size: medium;
		font-weight: 600;
		text-align: end;
	}
	.balance {
		display: flex;
	}

	.order {
		align-items: center;
		flex: 1;
		word-break: break-all;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.order div {
		padding: 2px;
	}

	.auth {
		display: flex;
		opacity: 0.9;
		align-content: center;
		width: 20px;
	}
</style>
