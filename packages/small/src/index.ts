import template from './template.v3.json' with { type: "json" };
import packageInfo from '../package.json' with { type: "json" };

import {
    binToHex,
    CompilerBch,
    createVirtualMachineBch,
    encodeTransactionBch,
    generateTransaction,
    hexToBin,
    InputTemplate,
    OutputTemplate,
    Output,
    verifyTransactionTokens
} from '@bitauth/libauth';

import {
    getAddress,
    type CashAddressNetworkPrefix,
    getLibauthCompiler,
    getScriptHash,
    UtxoI,
} from '@unspent/tau';


export default class SmallIndex {

    static USER_AGENT = packageInfo.name;

    static PROTOCOL_IDENTIFIER = "U3R";

    static VERSION = "1.0.0";

    static tokenAware = true;

    static template = template;

    static compiler: CompilerBch = getLibauthCompiler(this.template);

    static vm = createVirtualMachineBch();

    static getLockingBytecode(indexKey: string): Uint8Array {
        const lockingBytecodeResult = this.compiler.generateBytecode(
            {
                data: {
                    "bytecode": {
                        "key": hexToBin(indexKey)
                    }
                },
                scriptId: 'lock'
            })
        if (!lockingBytecodeResult.success) throw new Error(
            'Failed to generate bytecode, script: , ' + JSON.stringify(lockingBytecodeResult, null, '  '
            ));
        return lockingBytecodeResult.bytecode
    }

    /**
     * Get cashaddress
     *
     * @param indexKey - the key for the record.
     * @param reversed - whether to reverse the hash.
     * @throws {Error} if transaction generation fails.
     * @returns a cashaddress.
     */
    static getScriptHash(indexKey: string, reversed = true): string {
        return getScriptHash(this.getLockingBytecode(indexKey), reversed)
    }

    /**
     * Get cashaddress
     *
     * @param indexKey - the key for the record.
     * @param prefix - cashaddress prefix.
     * @throws {Error} if transaction generation fails.
     * @returns a cashaddress.
     */
    static getAddress(indexKey: string, prefix = "bitcoincash" as CashAddressNetworkPrefix): string {
        return getAddress(this.getLockingBytecode(indexKey), prefix, this.tokenAware)
    }

    static getSourceOutput(indexKey: string, utxo: UtxoI): Output {

        return {
            lockingBytecode: this.getLockingBytecode(indexKey),
            valueSatoshis: BigInt(utxo.value)
        }

    }

    static getInput(indexKey: string, utxo: UtxoI): InputTemplate<CompilerBch> {
        return {
            outpointIndex: utxo.tx_pos,
            outpointTransactionHash: hexToBin(utxo.tx_hash),
            sequenceNumber: utxo.value,
            unlockingBytecode: {
                data: {
                    "bytecode": {
                        "key": hexToBin(indexKey)
                    }
                },
                compiler: this.compiler,
                script: 'unlock',
                valueSatoshis: BigInt(utxo.value),
            },
        } as InputTemplate<CompilerBch>
    }

    static getOutput(): OutputTemplate<CompilerBch> {

        return {
            lockingBytecode: {
                data: {
                    // "bytecode": {
                    //     "key": hexToBin(indexKey)
                    // }
                },
                compiler: this.compiler,
                script: 'op_return'
            },
            valueSatoshis: BigInt(0)
        }

    }

    /**
     * Drop an expired record.
     *
     * @param indexKey - The index key for the record being dropped 
     * @param utxo - contract record to drop.
     *
     * @throws {Error} if transaction generation fails.
     * @returns a transaction template.
     */

    static drop(
        indexKey: string,
        utxo: UtxoI
    ): string {

        const inputs: InputTemplate<CompilerBch>[] = [];
        const outputs: OutputTemplate<CompilerBch>[] = [];

        let config = {
            locktime: 0,
            version: 2,
            inputs,
            outputs
        }

        config.inputs.push(this.getInput(indexKey, utxo));
        config.outputs.push(this.getOutput());

        let result = generateTransaction(config);
        if (!result.success) throw new Error('generate transaction failed!, errors: ' + JSON.stringify(result.errors, null, '  '));

        const sourceOutputs = [this.getSourceOutput(indexKey, utxo)];

        const transaction = result.transaction
        const tokenValidationResult = verifyTransactionTokens(
            transaction,
            sourceOutputs,
            { maximumTokenCommitmentLength: 40 }
        );
        if (tokenValidationResult !== true) throw tokenValidationResult;

        let verify = this.vm.verify({
            sourceOutputs: sourceOutputs,
            transaction: transaction,
        })

        if (typeof verify == "string") throw verify
        return binToHex(encodeTransactionBch(transaction))
    }

}