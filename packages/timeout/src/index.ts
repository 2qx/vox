import template from './template.v3.json' with { type: "json" };
import packageInfo from '../package.json' with { type: "json" };

import {
    binToHex,
    binToUtf8,
    binToNumberInt16LE,
    cashAssemblyToBin,
    CompilerBch,
    createVirtualMachineBch,
    encodeDataPush,
    encodeTransactionBch,
    generateTransaction,
    hexToBin,
    InputTemplate,
    OutputTemplate,
    Output,
    utf8ToBin,
    verifyTransactionTokens
} from '@bitauth/libauth';

import {
    BytecodeDataI,
    decodePushBytes,
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

    static PROTOCOL_IDENTIFIER = "U3T"
    static USER_AGENT = packageInfo.name;

    static EXECUTOR_FEE = 2500;

    static tokenAware = true;

    static template = template;

    static compiler: CompilerBch = getLibauthCompiler(this.template);

    static vm = createVirtualMachineBch();


    static parseNFT(utxo: UtxoI): BytecodeDataI {

        if (utxo.token_data?.nft?.commitment) {
            let byteData = decodePushBytes(hexToBin(utxo.token_data?.nft?.commitment))
            if (binToUtf8(byteData[0]!) !== this.PROTOCOL_IDENTIFIER) throw Error("Non-subscription record NFT passed as subscription")
            return {
                "recipient": byteData[1]!,
                "timeout": byteData[2]!,
                "auth": hexToBin(utxo.token_data.category)
            }
        } else {
            throw Error("Could not parse subscription NFT")
        }
    }



    static dataToBytecode(data: TimeoutData) {
        return {
            "recipient": hexToBin(data.recipient),
            "timeout": numToVm(data.timeout),
            "auth": hexToBin(data.auth)
        }
    }


    static encodeCommitment(data: TimeoutData): Uint8Array {
        let commitment = cashAssemblyToBin(
            `<"${this.PROTOCOL_IDENTIFIER}"><0x${data.recipient}><${data.timeout}>
        `)
        if (typeof commitment === "string") throw commitment
        return commitment
    }



    static getLockingBytecode(
        data: BytecodeDataI,
    ): Uint8Array {
        const lockingBytecodeResult = this.compiler.generateBytecode(
            {
                data: {
                    "bytecode": data
                },
                scriptId: 'lock'
            })
        if (!lockingBytecodeResult.success) throw new Error(
            'Failed to generate bytecode, script: , ' + JSON.stringify(lockingBytecodeResult, null, '  '
            ));
        return lockingBytecodeResult.bytecode
    }


    static getUnlockingBytecode(
        data: BytecodeDataI
    ): Uint8Array {
        const bytecodeResult = this.compiler.generateBytecode(
            {
                data: {
                    "bytecode": data
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
        data: BytecodeDataI,
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
        data: BytecodeDataI,
        prefix = "bitcoincash" as CashAddressNetworkPrefix): string {
        return getAddress(this.getLockingBytecode(data), prefix, this.tokenAware)
    }

    static getSourceOutput(
        data: BytecodeDataI,
        utxo: UtxoI): Output {

        return {
            lockingBytecode: this.getLockingBytecode(data),
            valueSatoshis: BigInt(utxo.value)
        }

    }

    static getInput(
        data: BytecodeDataI,
        utxo: UtxoI): InputTemplate<CompilerBch> {
        return {
            outpointIndex: utxo.tx_pos,
            outpointTransactionHash: hexToBin(utxo.tx_hash),
            sequenceNumber: utxo.value,
            unlockingBytecode: {
                data: {
                    "bytecode": data
                },
                compiler: this.compiler,
                script: 'unlock',
                valueSatoshis: BigInt(utxo.value),
            },
        } as InputTemplate<CompilerBch>
    }

    static getOutput(
        data: BytecodeDataI,
        utxo: UtxoI
    ): OutputTemplate<CompilerBch> {

        return {
            lockingBytecode: data["recipient"]!,
            valueSatoshis: BigInt(utxo.value - this.EXECUTOR_FEE),
            token: utxo.token_data ? {
                category: hexToBin(utxo.token_data!.category!),
                amount: BigInt(utxo.token_data!.amount),
                nft: utxo.token_data.nft ? {
                    commitment: hexToBin(utxo.token_data.nft.commitment!),
                    capability: utxo.token_data.nft.capability,
                } : undefined
            } : undefined
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
        data: BytecodeDataI,
        valueUtxos: UtxoI[]
    ): Output[] {
        const sourceOutputs: Output[] = [];
        sourceOutputs.push(...valueUtxos.map((u: UtxoI) => this.getSourceOutput(data, u)));
        return sourceOutputs
    }

    /**
     * Liquidate the contact upon timeout.
     *
     * @param record - The utxo carrying the NFT record of the contract
     * @param utxo - contract record to pay out.
     *
     * @throws {Error} if transaction generation fails.
     * @returns a transaction template.
     */

    static liquidate(
        record: UtxoI,
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

        let data = this.parseNFT(record)

        config.inputs.push(this.getInput(data, utxo));
        config.outputs.push(this.getOutput(data, utxo));

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