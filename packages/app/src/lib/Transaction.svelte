<script lang="ts">
	import { binToHex } from '@bitauth/libauth';
	import { sumSourceOutputValue, sumSourceOutputTokenAmounts } from '@unspent/tau';
	let { transaction, sourceOutputs, category } = $props();
</script>

Locktime: {transaction.locktime}<br />
Version: {transaction.version}
<div class="twoUp">
	<div>
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
						<td class="r sats">
							{i.valueSatoshis.toLocaleString()}
						</td>

						<td class="r sats">
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
							{sumSourceOutputTokenAmounts(sourceOutputs, category).toLocaleString()}
						</i>
					</td>
				</tr>
			</tfoot>
		</table>
	</div>
	<div>
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
						<td class="r sats">
							{o.valueSatoshis.toLocaleString()}
						</td>
						<td class="r sats">
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
							{sumSourceOutputTokenAmounts(transaction.outputs, category).toLocaleString()}
						</i>
					</td>
				</tr>
			</tfoot>
		</table>
	</div>
</div>

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
						sumSourceOutputTokenAmounts(sourceOutputs, category) -
						sumSourceOutputTokenAmounts(transaction.outputs, category)
					).toLocaleString()}
				</i>
			</td>
		</tr>
	</tfoot>
</table>

<style>
	.twoUp {
		display: flex;
	}
	.twoUp div {
		width: 50%;
	}

	table {
		width: 100%;
	}
	.r {
		min-width: 50%;
		text-align: right;
	}
	.sats {
		font-size: x-small;
	}

	tfoot {
		font-weight: 700;
	}
	thead tr td {
		
		border: 2px ridge rgba(247, 202, 248, 0.6);
		background-color: #ffffff5b;
	}

	thead tr:nth-child(odd) {
		text-align: center;

		font-weight: 900;
	}
	tbody tr:nth-child(odd) {
		background-color: #ff33cc1f;
	}
	tbody tr:nth-child(even) {
		background-color: #e495e41a;
	}
</style>
