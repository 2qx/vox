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
    verifyTransactionTokens,
    numberToBinUint16LE,
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

export interface LocktimeData {
    locktime: number,
    recipient: string
}


export default class Locktime {

    static USER_AGENT = packageInfo.name;

    static PROTOCOL_IDENTIFIER = "U3L";

    static tokenAware = true;

    static template = template;

    static compiler: CompilerBch = getLibauthCompiler(this.template);

    static vm = createVirtualMachineBch();

    static dataToBytecode(data: LocktimeData) {
        return {
            "locktime": numToVm(data.locktime),
            "recipient": hexToBin(data.recipient)
        }
    }

    static getLockingBytecode(
        data: LocktimeData
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

    /**
     * Get cashaddress
     *
     * @param locktime - absolute all funds are locked until.
     * @param recipient - locking bytecode receiving funds.
     * @param reversed - whether to reverse the hash.
     * @throws {Error} if transaction generation fails.
     * @returns a cashaddress.
     */
    static getScriptHash(
        data: LocktimeData,
        reversed = true): string {
        return getScriptHash(this.getLockingBytecode(data), reversed)
    }

    /**
     * Get cashaddress
     *
     * @param locktime - absolute all funds are locked until.
     * @param recipient - locking bytecode receiving funds.
     * @param prefix - cashaddress prefix.
     * @throws {Error} if transaction generation fails.
     * @returns a cashaddress.
     */
    static getAddress(
        data: LocktimeData,
        prefix = "bitcoincash" as CashAddressNetworkPrefix): string {
        return getAddress(this.getLockingBytecode(data), prefix, this.tokenAware)
    }

    static getSourceOutput(
        data: LocktimeData,
        utxo: UtxoI): Output {

        return {
            lockingBytecode: this.getLockingBytecode(data),
            valueSatoshis: BigInt(utxo.value)
        }

    }

    static getInput(
        data: LocktimeData,
        utxo: UtxoI): InputTemplate<CompilerBch> {
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
        } as InputTemplate<CompilerBch>
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
     * Get source outputs, transform contract & wallet outpoints for spending verification.
     *
     * @param contractUtxo - contract outputs to use as input.
     * @param walletUtxo - wallet outputs to use as input.
     * @param key - private key to sign transaction wallet inputs.
     *
     * @returns a transaction template.
     */

    static getSourceOutputs(
        data: LocktimeData,
        valueUtxos: UtxoI[]
    ): Output[] {
        const sourceOutputs: Output[] = [];
        sourceOutputs.push(...valueUtxos.map((u: UtxoI) => this.getSourceOutput(data, u)));
        return sourceOutputs
    }

    /**
     * Drop expired records.
     *
     * @param data - The parameters of the locktime contract.
     * @param valueUtxos[] - contract records to drop.
     *
     * @throws {Error} if transaction generation fails.
     * @returns a transaction template.
     */

    static unlock(
        data: LocktimeData,
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

        config.inputs.push(this.getInput(data, utxo));
        config.outputs.push(this.getOutput());

        let result = generateTransaction(config);
        if (!result.success) throw new Error('generate transaction failed!, errors: ' + JSON.stringify(result.errors, null, '  '));

        const sourceOutputs = [this.getSourceOutput(data, utxo)];

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