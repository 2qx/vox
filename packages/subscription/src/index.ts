import template from './template.v3.json' with { type: "json" };

import {
    binToHex,
    CompilerBCH,
    createVirtualMachineBCH,
    encodeTransactionBCH,
    generateTransaction,
    hexToBin,
    InputTemplate,
    OutputTemplate,
    Output,
    verifyTransactionTokens,
    numberToBinUint16BE,
    bigIntToVmNumber
} from '@bitauth/libauth';

import {
    getAddress,
    type CashAddressNetworkPrefix,
    getLibauthCompiler,
    getScriptHash,
    numToVm,
    UtxoI,
} from '@unspent/tau';


export interface SubscriptionData {
    installment: number,
    recipient: string,
    period: number,
    auth: string
}



export default class Subscription {

    static tokenAware = true;

    static template = template;

    static compiler: CompilerBCH = getLibauthCompiler(this.template);

    static vm = createVirtualMachineBCH();

    static dataToBytecode(data: SubscriptionData) {
        return {
            "installment": numToVm(data.installment),
            "recipient": hexToBin(data.recipient),
            "period": numToVm(data.period),
            "auth": hexToBin(data.auth),
        }
    }

    static getLockingBytecode(
        data: SubscriptionData
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
        data: SubscriptionData
    ): Uint8Array {
        const bytecodeResult = this.compiler.generateBytecode(
            {
                data: {
                    "bytecode": this.dataToBytecode(data)
                },
                scriptId: 'step'
            })
        if (!bytecodeResult.success) throw new Error(
            'Failed to generate bytecode, script: , ' + JSON.stringify(bytecodeResult, null, '  '
            ));
        return bytecodeResult.bytecode
    }

    /**
     * Get cashaddress
     *
     * @param data - the parameters of the subscription.
     * @param reversed - whether to reverse the hash.
     * @throws {Error} if transaction generation fails.
     * @returns a cashaddress.
     */
    static getScriptHash(
        data: SubscriptionData,
        reversed = true
    ): string {
        return getScriptHash(this.getLockingBytecode(data), reversed)
    }

    /**
     * Get cashaddress
     *
     * @param data - the parameters of the subscription.
     * @param prefix - cashaddress prefix.
     * @throws {Error} if transaction generation fails.
     * @returns a cashaddress.
     */
    static getAddress(
        data: SubscriptionData,
        prefix = "bitcoincash" as CashAddressNetworkPrefix
    ): string {
        return getAddress(this.getLockingBytecode(data), prefix, this.tokenAware)
    }

    static getSourceOutput(
        data: SubscriptionData,
        utxo: UtxoI
    ): Output {

        return {
            lockingBytecode: this.getLockingBytecode(data),
            valueSatoshis: BigInt(utxo.value)
        }

    }

    static getInput(
        data: SubscriptionData,
        utxo: UtxoI
    ): InputTemplate<CompilerBCH> {
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
     * @param data - the parameters of the subscription.
     * @param valueUtxos - wallet outputs to use as input.
     * @param key - private key to sign transaction wallet inputs.
     *
     * @returns a transaction template.
     */

    static getSourceOutputs(
        data: SubscriptionData,
        valueUtxos: UtxoI[]
    ): Output[] {
        const sourceOutputs: Output[] = [];
        sourceOutputs.push(...valueUtxos.map((u: UtxoI) => this.getSourceOutput(data, u)));
        return sourceOutputs
    }

    /**
     * Step expired records.
     *
     * @param data - The parameters of the subscription
     * @param utxo - The output paying the installment
     *
     * @throws {Error} if transaction generation fails.
     * @returns a transaction template.
     */

    static step(
        data: SubscriptionData,
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