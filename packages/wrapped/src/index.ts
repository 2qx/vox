import template from './wrapped.template.json' with { type: "json" };


import {
    CashAddressNetworkPrefix,
    CompilerBCH,
    generateTransaction,
    hexToBin,
    InputTemplate,
    OutputTemplate,
    Transaction,
} from '@bitauth/libauth';

import {
    getLibauthCompiler,
    getScriptHash,
    getAddress,
    UtxoI
} from '@unspent/tau';

const WBCH = hexToBin('ff4d6e4b90aa8158d39c5dc874fd9411af1ac3b5ed6f354755e8362a0d02c6b3')
    

export default class Wrap {

    static template = template

    static compiler: CompilerBCH = getLibauthCompiler(this.template)

    static getLockingBytecode(data = {}): Uint8Array {
        const lockingBytecodeResult = this.compiler.generateBytecode({
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

    static getOutput(utxo: UtxoI, amount: number): OutputTemplate<CompilerBCH> {

            return {
                lockingBytecode: {
                    compiler: this.compiler,
                    script: 'lock'
                },
                valueSatoshis: BigInt(utxo.value + amount),
                token:{
                    category: WBCH,
                    amount: BigInt(utxo.token_data?.amount!) - BigInt(amount)

                }
            }
         
    }

    static getInput(utxo: UtxoI): InputTemplate<CompilerBCH> {
        return {
            outpointIndex: utxo.tx_pos,
            outpointTransactionHash: hexToBin(utxo.tx_hash),
            unlockingBytecode: {
                compiler: this.compiler,
                script: 'unlock',
                valueSatoshis: BigInt(utxo.value),
            },
        } as InputTemplate<CompilerBCH>
    }

    

    /**
	 * Calls a method on the remote server with the supplied parameters.
	 *
	 * @param amount     - amount to wrap (satoshis), negative to unwrap.
	 * @param walletUtxos - wallet outputs to use as input.
	 * @param contractUtxos - contract outputs to use as input.
	 * @param publicKey - public key to sign .
	 *
	 * @throws {Error} if the client is disconnected.
	 * @returns a promise that resolves with the result of the method or an Error.
	 */

    static swap(
        amount: number,
        contractUtxos: UtxoI[],
        //walletUtxos: UtxoI[],
        //key: string|Uint8Array
    ): Transaction {

        const inputs: InputTemplate<CompilerBCH>[] = [];
        const outputs: OutputTemplate<CompilerBCH>[] = [];

        outputs.push(this.getOutput(contractUtxos[0]!, amount));
        inputs.push(this.getInput(contractUtxos[0]!, ));

        // 
        // TODO
        //

        const result = generateTransaction({
            locktime: 0,
            version: 2,
            inputs, outputs,
        });
        if (!result.success) {
            /* c8 ignore next */
            throw new Error('generate transaction failed!, errors: ' + JSON.stringify(result.errors, null, '  '));
        }
        return result.transaction
    }

}