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


export default class Dutch {

    static USER_AGENT = packageInfo.name;

    static PROTOCOL_IDENTIFIER = "U3A";

    static tokenAware = true;

    static template = template;

    static compiler: CompilerBch = getLibauthCompiler(this.template);

    static vm = createVirtualMachineBch();

    static dataToBytecode(data: LocktimeData) {
        return {
            "open": numToVm(data.locktime),
            "recipient": hexToBin(data.recipient)
        }
    }

    static getLockingBytecode(
        open: number,
        recipient: Uint8Array | string,
    ): Uint8Array {
        if (typeof recipient == "string") recipient = hexToBin(recipient)
        const lockingBytecodeResult = this.compiler.generateBytecode(
            {
                data: {
                    "bytecode": {
                        "open": bigIntToVmNumber(BigInt(open)),
                        "recipient": recipient
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
     * @param open - opening ask.
     * @param recipient - locking bytecode receiving funds.
     * @param reversed - whether to reverse the hash.
     * @throws {Error} if transaction generation fails.
     * @returns a cashaddress.
     */
    static getScriptHash(
        open: number,
        recipient: Uint8Array | string,
        reversed = true): string {
        return getScriptHash(this.getLockingBytecode(open, recipient), reversed)
    }

    /**
     * Get cashaddress
     *
     * @param open - opening ask.
     * @param recipient - locking bytecode receiving funds.
     * @param prefix - cashaddress prefix.
     * @throws {Error} if transaction generation fails.
     * @returns a cashaddress.
     */
    static getAddress(
        open: number,
        recipient: Uint8Array | string,
        prefix = "bitcoincash" as CashAddressNetworkPrefix): string {
        return getAddress(this.getLockingBytecode(open, recipient), prefix, this.tokenAware)
    }

    static getSourceOutput(
        open: number,
        recipient: Uint8Array | string,
        utxo: UtxoI): Output {

        return {
            lockingBytecode: this.getLockingBytecode(open, recipient),
            valueSatoshis: BigInt(utxo.value)
        }

    }

    static getInput(
        open: number,
        recipient: Uint8Array | string,
        utxo: UtxoI): InputTemplate<CompilerBch> {
        if (typeof recipient == "string") recipient = hexToBin(recipient)
        return {
            outpointIndex: utxo.tx_pos,
            outpointTransactionHash: hexToBin(utxo.tx_hash),
            sequenceNumber: utxo.value,
            unlockingBytecode: {
                data: {
                    "bytecode": {
                        "open": bigIntToVmNumber(BigInt(open)),
                        "recipient": recipient
                    }
                },
                compiler: this.compiler,
                script: 'unlock',
                valueSatoshis: BigInt(utxo.value),
            },
        } as InputTemplate<CompilerBch>
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
        open: number,
        recipient: Uint8Array | string,
        valueUtxos: UtxoI[]
    ): Output[] {
        const sourceOutputs: Output[] = [];
        sourceOutputs.push(...valueUtxos.map((u: UtxoI) => this.getSourceOutput(open, recipient, u)));
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

    static bid(
        open: number,
        recipient: Uint8Array | string,
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

        config.inputs.push(this.getInput(open, recipient, utxo));
        //config.outputs.push(this.getOutput(open, recipient));

        let result = generateTransaction(config);
        if (!result.success) throw new Error('generate transaction failed!, errors: ' + JSON.stringify(result.errors, null, '  '));

        const sourceOutputs = [this.getSourceOutput(open, recipient, utxo)];

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