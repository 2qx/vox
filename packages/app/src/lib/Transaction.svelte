<script lang="ts">
	import { binToHex } from '@bitauth/libauth';
	import { sumSourceOutputValue, sumSourceOutputTokenAmounts } from '@unspent/tau';
	let { transaction, sourceOutputs } = $props();
</script>

<p>Transaction</p>

Locktime: {transaction.locktime}
Version: {transaction.version}
<h4>Inputs</h4>
<table>
	<thead class="r">
		<tr>
			<td>Sats </td>
			<td> Tokens</td>
		</tr>
	</thead>
	<tbody>
		{#each sourceOutputs as i}
			<tr>
				<td class="r">
					{i.valueSatoshis.toLocaleString()}
				</td>

				<td class="r">
					{#if i.token}
						<i>{i.token.amount.toLocaleString()}</i>
					{:else}
						<i>0</i>
					{/if}
				</td>
			</tr>
		{/each}
	</tbody>
	<tfoot>
		<tr>
			<td class="r">
				{sumSourceOutputValue(sourceOutputs).toLocaleString()}
			</td>
			<td class="r">
				<i>
					{sumSourceOutputTokenAmounts(
						sourceOutputs,
						binToHex(sourceOutputs[0].token.category)
					).toLocaleString()}
				</i>
			</td>
		</tr>
	</tfoot>
</table>
<h4>Outputs</h4>
<table>
	<thead class="r">
		<tr>
			<td>Sats </td>
			<td> Tokens</td>
		</tr>
	</thead>
	<tbody>
		{#each transaction.outputs as o}
			<tr>
				<td class="r">
					{o.valueSatoshis.toLocaleString()}
				</td>
				<td class="r">
					{#if o.token}
						<i>{o.token.amount.toLocaleString()}</i>
					{:else}
						<i>0</i>
					{/if}
				</td>
			</tr>
		{/each}
	</tbody>
	<tfoot>
		<tr>
			<td class="r">
				{sumSourceOutputValue(transaction.outputs).toLocaleString()}
			</td>
			<td class="r">
				<i>
					{sumSourceOutputTokenAmounts(
						transaction.outputs,
						binToHex(sourceOutputs[0].token.category)
					).toLocaleString()}
				</i>
			</td>
		</tr>
	</tfoot>
</table>

<h4>Difference</h4>
<table>
	<thead class="r">
		<tr>
			<td>Sats </td>
			<td> Tokens </td>
		</tr>
	</thead>

	<tfoot>
		<tr>
			<td class="r">
				Fee:
				{(
					sumSourceOutputValue(sourceOutputs) - sumSourceOutputValue(transaction.outputs)
				).toLocaleString()}
			</td>
			<td class="r">
				<i
					>Burned:
					{(
						sumSourceOutputTokenAmounts(sourceOutputs, binToHex(sourceOutputs[0].token.category)) -
						sumSourceOutputTokenAmounts(
							transaction.outputs,
							binToHex(sourceOutputs[0].token.category)
						)
					).toLocaleString()}
				</i>
			</td>
		</tr>
	</tfoot>
</table>

<style>
	.row {
		display: flex;
	}
	.r {
		min-width: 300px;
		text-align: right;
	}
	tfoot {
		font-weight: 700;
	}
</style>
