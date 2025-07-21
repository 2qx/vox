import template from './template.v3.json' with { type: "json" };

import {
    binToHex,
    CompilerBCH,
    createVirtualMachineBCH,
    encodeDataPush,
    encodeTransactionBCH,
    generateTransaction,
    hexToBin,
    InputTemplate,
    OutputTemplate,
    Output,
    utf8ToBin,
    verifyTransactionTokens
} from '@bitauth/libauth';

import {
    getAddress,
    type CashAddressNetworkPrefix,
    getLibauthCompiler,
    getScriptHash,
    UtxoI,
    numToVm,
} from '@unspent/tau';

export interface TimeoutData {
    recipient: string,
    timeout: number,
    auth: string
}




export default class Timeout {

    static tokenAware = true;

    static identifier = "UT3";

    static template = template;

    static compiler: CompilerBCH = getLibauthCompiler(this.template);

    static vm = createVirtualMachineBCH();

    static dataToBytecode(data: TimeoutData) {
        return {
            "recipient": hexToBin(data.recipient),
            "timeout": numToVm(data.timeout),
            "auth": hexToBin(data.auth)
        }
    }

    static dataToCommitmentRecord(data: TimeoutData): Uint8Array {
        const byteData = this.dataToBytecode(data)
        return Uint8Array.from([
            ...encodeDataPush(byteData.recipient),
            ...encodeDataPush(byteData.timeout)
        ])
    }

    static getLockingBytecode(
        data: TimeoutData,
    ): Uint8Array {
        const lockingBytecodeResult = this.compiler.generateBytecode(
            {
                data: {
                    "bytecode": this.dataToBytecode(data)
                },
                scriptId: 'lock'
            })
        if (!lockingBytecodeResult.success) throw new Error(
            'Failed to generate bytecode, script: , ' + JSON.stringify(lockingBytecodeResult, null, '  '
            ));
        return lockingBytecodeResult.bytecode
    }


    static getUnlockingBytecode(
        data: TimeoutData
    ): Uint8Array {
        const bytecodeResult = this.compiler.generateBytecode(
            {
                data: {
                    "bytecode": this.dataToBytecode(data)
                },
                scriptId: 'unlock'
            })
        if (!bytecodeResult.success) throw new Error(
            'Failed to generate bytecode, script: , ' + JSON.stringify(bytecodeResult, null, '  '
            ));
        return bytecodeResult.bytecode
    }

    /**
     * Get cashaddress
     *
     * @param data - the timeout parameters.
     * @param reversed - whether to reverse the hash.
     * @throws {Error} if transaction generation fails.
     * @returns a cashaddress.
     */
    static getScriptHash(
        data: TimeoutData,
        reversed = true): string {
        return getScriptHash(this.getLockingBytecode(data), reversed)
    }

    /**
     * Get cashaddress
     *
     * @param data - the timeout parameters.
     * @param prefix - cashaddress prefix.
     * @throws {Error} if transaction generation fails.
     * @returns a cashaddress.
     */
    static getAddress(
        data: TimeoutData,
        prefix = "bitcoincash" as CashAddressNetworkPrefix): string {
        return getAddress(this.getLockingBytecode(data), prefix, this.tokenAware)
    }

    static getSourceOutput(
        data: TimeoutData,
        utxo: UtxoI): Output {

        return {
            lockingBytecode: this.getLockingBytecode(data),
            valueSatoshis: BigInt(utxo.value)
        }

    }

    static getInput(
        data: TimeoutData,
        utxo: UtxoI): InputTemplate<CompilerBCH> {
        return {
            outpointIndex: utxo.tx_pos,
            outpointTransactionHash: hexToBin(utxo.tx_hash),
            sequenceNumber: utxo.value,
            unlockingBytecode: {
                data: {
                    "bytecode": this.dataToBytecode(data)
                },
                compiler: this.compiler,
                script: 'unlock',
                valueSatoshis: BigInt(utxo.value),
            },
        } as InputTemplate<CompilerBCH>
    }

    static getOutput(): OutputTemplate<CompilerBCH> {

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
     * Get source outputs, transform contract & wallet outpoints for spending verification.
     *
     * @param contractUtxo - contract outputs to use as input.
     * @param walletUtxo - wallet outputs to use as input.
     * @param key - private key to sign transaction wallet inputs.
     *
     * @returns a transaction template.
     */

    static getSourceOutputs(
        data: TimeoutData,
        valueUtxos: UtxoI[]
    ): Output[] {
        const sourceOutputs: Output[] = [];
        sourceOutputs.push(...valueUtxos.map((u: UtxoI) => this.getSourceOutput(data, u)));
        return sourceOutputs
    }

    /**
     * Liquidate the contact upon timeout.
     *
     * @param data - The 
     * @param utxo - contract record to pay out.
     *
     * @throws {Error} if transaction generation fails.
     * @returns a transaction template.
     */

    static liquidate(
        data: TimeoutData,
        utxo: UtxoI
    ): string {

        const inputs: InputTemplate<CompilerBCH>[] = [];
        const outputs: OutputTemplate<CompilerBCH>[] = [];

        let config = {
            locktime: 0,
            version: 2,
            inputs,
            outputs
        }

        config.inputs.push(this.getInput(data, utxo));
        config.outputs.push(this.getOutput());

        let result = generateTransaction(config);
        if (!result.success) throw new Error('generate transaction failed!, errors: ' + JSON.stringify(result.errors, null, '  '));

        const sourceOutputs = [this.getSourceOutput(data, utxo)];

        const transaction = result.transaction
        const tokenValidationResult = verifyTransactionTokens(
            transaction,
            sourceOutputs
        );
        if (tokenValidationResult !== true) throw tokenValidationResult;

        let verify = this.vm.verify({
            sourceOutputs: sourceOutputs,
            transaction: transaction,
        })

        if (typeof verify == "string") throw verify
        return binToHex(encodeTransactionBCH(transaction))
    }

}