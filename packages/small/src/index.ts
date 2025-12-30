import template from './template.v3.json' with { type: "json" };
import packageInfo from '../package.json' with { type: "json" };

import {
    CompilerBch,
    createVirtualMachineBch,
    generateTransaction,
    hexToBin,
    InputTemplate,
    OutputTemplate,
    Output,
    Transaction,
    verifyTransactionTokens,
    utf8ToBin,
    isHex,
    swapEndianness
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

    static parseKey(indexKey: string | Uint8Array): Uint8Array{
        if (typeof indexKey == "string") {
            if (isHex(indexKey)) {
                indexKey = hexToBin(indexKey)
            } else {
                indexKey = utf8ToBin(indexKey)
            }
        }
        return indexKey
    }


    static getLockingBytecode(indexKey: string | Uint8Array): Uint8Array {
        

        const lockingBytecodeResult = this.compiler.generateBytecode(
            {
                data: {
                    "bytecode": {
                        "key": this.parseKey(indexKey)
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
    static getAddress(indexKey: string | Uint8Array, prefix = "bitcoincash" as CashAddressNetworkPrefix): string {
        return getAddress(this.getLockingBytecode(indexKey), prefix, this.tokenAware)
    }

    static getSourceOutput(indexKey: string|Uint8Array, utxo: UtxoI): Output {

        return {
            lockingBytecode: this.getLockingBytecode(indexKey),
            valueSatoshis: BigInt(utxo.value)
        }

    }

     static getSourceOutputs(indexKey: string|Uint8Array, utxos: UtxoI[]): Output[]{
        return utxos.map( (u:UtxoI) =>{
            return this.getSourceOutput(indexKey, u)
        })
    }

    static getInput(indexKey: string|Uint8Array, utxo: UtxoI): InputTemplate<CompilerBch> {
        return {
            outpointIndex: utxo.tx_pos,
            outpointTransactionHash: hexToBin(utxo.tx_hash),
            sequenceNumber: utxo.value,
            unlockingBytecode: {
                data: {
                    "bytecode": {
                        "key": this.parseKey(indexKey)
                    }
                },
                compiler: this.compiler,
                script: 'unlock',
                valueSatoshis: BigInt(utxo.value),
            },
        } as InputTemplate<CompilerBch>
    }


    static getInputs(indexKey: string|Uint8Array, utxos: UtxoI[]): InputTemplate<CompilerBch>[]{
        return utxos.map( (u:UtxoI) =>{
            return this.getInput(indexKey, u)
        })
    }

    static getOutput(): OutputTemplate<CompilerBch> {

        return {
            lockingBytecode: {
                data: {},
                compiler: this.compiler,
                script: 'op_return'
            },
            valueSatoshis: BigInt(0)
        }

    }

    /**
     * Drop expired records.
     *
     * @param indexKey - The index key for the record being dropped 
     * @param utxos - List of records to drop.
     *
     * @throws {Error} if transaction generation fails.
     * @returns a transaction template.
     */

    static drop(
        indexKey: string|Uint8Array,
        utxos: UtxoI[]
    ): {
        transaction: Transaction,
        sourceOutputs: Output[],
        verify: string | boolean
    } {

        const inputs: InputTemplate<CompilerBch>[] = [];
        const outputs: OutputTemplate<CompilerBch>[] = [];

        let config = {
            locktime: 0,
            version: 2,
            inputs,
            outputs
        }

        config.inputs.push(... this.getInputs(indexKey, utxos));
        config.outputs.push(this.getOutput());

        let result = generateTransaction(config);
        if (!result.success) throw new Error('generate transaction failed!, errors: ' + JSON.stringify(result.errors, null, '  '));

        const sourceOutputs = [... this.getSourceOutputs(indexKey, utxos)];

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

        return {
            sourceOutputs: sourceOutputs,
            transaction: transaction,
            verify: verify
        }
    }

}