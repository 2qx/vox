import { DEFAULT_CONCURRENCY } from "./constant.js";

/**
 * Same as Promise.all(items.map(item => task(item))), but it waits for
 * the first {batchSize} promises to finish before starting the next batch.
 *
 * @template A
 * @template B
 * @param {function(A): B} task The task to run for each item.
 * @param {A[]} items Arguments to pass to the task for each call.
 * @param {int} batchSize
 * @returns {Promise<B[]>}
 */
export async function promiseAllInBatches(task:any, items:any, batchSize = DEFAULT_CONCURRENCY) {
    let position = 0;
    let results:any = [];
    while (position < items.length) {
        const itemsForBatch = items.slice(position, position + batchSize);
        results = [...results, ...await Promise.all(itemsForBatch.map((item:any) => task(item)))];
        position += batchSize;
    }
    return results;
}

export async function getTransactionWrap(args:any[]) {
    let result = await args[0].request('blockchain.transaction.get', args[1], false);
    return result
}

export async function getAllTransactions(electrumClient:any, tx_hashes:string[]) {
    return promiseAllInBatches(getTransactionWrap, tx_hashes.map(tx_hash => [electrumClient, tx_hash]))
}