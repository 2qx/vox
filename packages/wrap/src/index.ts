import template from './wrapped.template.json' with { type: "json" };

import {
    binToHex,
    CashAddressNetworkPrefix,
    CompilerBCH,
    CompilationData,
    generateTransaction,
    hexToBin,
    InputTemplate,
    OutputTemplate,
    Transaction,
} from '@bitauth/libauth';

import {
    adjustTransactionFees,
    getAddress,
    getLibauthCompiler,
    getScriptHash,
    getWalletCompilationData,
    UtxoI,
    sumUtxoValue,
    sumTokenAmounts
} from '@unspent/tau';

const WBCH = hexToBin('ff4d6e4b90aa8158d39c5dc874fd9411af1ac3b5ed6f354755e8362a0d02c6b3')


export default class Wrap {

    static template = template

    static compiler: CompilerBCH = getLibauthCompiler(this.template)

    static getLockingBytecode(data = {}): Uint8Array {
        const lockingBytecodeResult = this.compiler.generateBytecode(
            {
                data: data,
                scriptId: 'lock'
            })
        if (!lockingBytecodeResult.success) {
            /* c8 ignore next */
            throw new Error('Failed to generate bytecode, script: , ' + JSON.stringify(lockingBytecodeResult, null, '  '));
        }
        return lockingBytecodeResult.bytecode
    }

    static getScriptHash(reversed = true): string {
        return getScriptHash(this.getLockingBytecode(), reversed)
    }

    static getAddress(prefix = "bitcoincash" as CashAddressNetworkPrefix): string {
        return getAddress(this.getLockingBytecode(), prefix)
    }

    static getInput(utxo: UtxoI): InputTemplate<CompilerBCH> {
        return {
            outpointIndex: utxo.tx_pos,
            outpointTransactionHash: hexToBin(utxo.tx_hash),
            sequenceNumber: 0,
            unlockingBytecode: {
                compiler: this.compiler,
                script: 'unlock',
                valueSatoshis: BigInt(utxo.value),
            },
        } as InputTemplate<CompilerBCH>
    }

    static getWalletInput(utxo: UtxoI, hdKey: CompilationData): InputTemplate<CompilerBCH> {

        return {
            outpointIndex: utxo.tx_pos,
            outpointTransactionHash: hexToBin(utxo.tx_hash),
            sequenceNumber: 0,
            unlockingBytecode: {
                compiler: this.compiler,
                data: hdKey,
                script: 'wallet_unlock',
                valueSatoshis: BigInt(utxo.value),
            },
        } as InputTemplate<CompilerBCH>
    }

    static getOutput(utxo: UtxoI, amount: number): OutputTemplate<CompilerBCH> {

        return {
            lockingBytecode: {
                compiler: this.compiler,
                script: 'lock'
            },
            valueSatoshis: BigInt(utxo.value + amount),
            token: {
                category: hexToBin(utxo.token_data!.category!),
                amount: BigInt(utxo.token_data?.amount!) - BigInt(amount)

            }
        }

    }

    static getChangeOutput(utxos: UtxoI[], amount: number, hdKey: any): OutputTemplate<CompilerBCH> {

        const sats = sumUtxoValue(utxos)
        const wsats = sumTokenAmounts(utxos, binToHex(WBCH))
        return {
            lockingBytecode: {
                compiler: this.compiler,
                data: hdKey,
                script: 'wallet_lock'
            },
            valueSatoshis: BigInt(sats - amount),
            token: {
                category: WBCH,
                amount: BigInt(wsats) + BigInt(amount)
            }
        }

    }


    /**
     * Wrap (+) or Unwrap (-) some amount of WBCH.
     *
     * @param amount     - amount to wrap (satoshis), negative to unwrap.
     * @param contractUtxo - contract outputs to use as input.
     * @param walletUtxos - wallet outputs to use as input.
     * @param key - private key to sign transaction wallet inputs.
     * @param fee - transaction fee to pay (per byte).
     *
     * @throws {Error} if transaction generation fails.
     * @returns a transaction template.
     */

    static swap(
        amount: number,
        contractUtxo: UtxoI,
        walletUtxos: UtxoI[],
        key: string,
        fee = 1
    ): Transaction {

        const inputs: InputTemplate<CompilerBCH>[] = [];
        const outputs: OutputTemplate<CompilerBCH>[] = [];

        let wallet = getWalletCompilationData(key)

        inputs.push(this.getInput(contractUtxo));
        inputs.push(...walletUtxos.map(u => { return this.getWalletInput(u, wallet.unlockData) }));

        outputs.push(this.getOutput(contractUtxo, amount));
        outputs.push(this.getChangeOutput(walletUtxos, amount, wallet.lockData));

        const result = generateTransaction(
            {
                locktime: 0,
                version: 2,
                inputs,
                outputs
            });

        if (!result.success) {
            /* c8 ignore next */
            throw new Error('generate transaction failed!, errors: ' + JSON.stringify(result.errors, null, '  '));
        }

        const transaction = adjustTransactionFees(result.transaction, result.transaction.outputs.length - 1, fee)

        return transaction
    }

}