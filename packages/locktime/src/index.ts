import template from './template.v3.json' with { type: "json" };
import packageInfo from '../package.json' with { type: "json" };

import {
    binToHex,
    binToUtf8,
    binToNumberUintLE,
    cashAddressToLockingBytecode,
    cashAssemblyToBin,
    CompilerBch,
    createVirtualMachineBch,
    generateTransaction,
    hexToBin,
    InputTemplate,
    OutputTemplate,
    Output,
    Transaction,
    verifyTransactionTokens
} from '@bitauth/libauth';

import {
    BytecodeDataI,
    decodePushBytes,
    getAddress,
    getTransactionFees,
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


export type LocktimeJob = {
    record: UtxoI,
    utxo: UtxoI
}


export default class Locktime {

    static USER_AGENT = packageInfo.name;

    static PROTOCOL_IDENTIFIER = "U3L";

    static EXECUTOR_FEE = 2500;

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

    static parseNFT(utxo: UtxoI): BytecodeDataI {

        if (utxo.token_data?.nft?.commitment) {
            let byteData = decodePushBytes(hexToBin(utxo.token_data?.nft?.commitment))
            if (binToUtf8(byteData[0]!) !== this.PROTOCOL_IDENTIFIER) throw Error("Non-locktime record NFT passed as locktime")
            return {
                "recipient": byteData[1]!,
                "locktime": byteData[2]!,
            }
        } else {
            throw Error("Could not parse locktime NFT")
        }
    }

    static encodeCommitment(data: LocktimeData) {
        let commitment = cashAssemblyToBin(
            `<"${this.PROTOCOL_IDENTIFIER}"><0x${data.recipient}><${data.locktime}>`
        )
        if (typeof commitment === "string") throw commitment
        return binToHex(commitment)
    }


    static getLockingBytecode(
        data: BytecodeDataI
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
        record: UtxoI,
        reversed = true): string {
        return getScriptHash(
            this.getLockingBytecode(this.parseNFT(record)),
            reversed
        )
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
        let bytecode = this.dataToBytecode(data)
        return getAddress(this.getLockingBytecode(bytecode), prefix, this.tokenAware)
    }

    static getSourceOutput(
        data: BytecodeDataI,
        utxo: UtxoI): Output {

        return {
            lockingBytecode: this.getLockingBytecode(data),
            valueSatoshis: BigInt(utxo.value),
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

    static getInput(
        data: BytecodeDataI,
        utxo: UtxoI): InputTemplate<CompilerBch> {
        return {
            outpointIndex: utxo.tx_pos,
            outpointTransactionHash: hexToBin(utxo.tx_hash),
            sequenceNumber: 0,
            unlockingBytecode: {
                data: {
                    "bytecode": data
                },
                compiler: this.compiler,
                script: 'unlock',
                valueSatoshis: BigInt(utxo.value),
                token: utxo.token_data ? {
                    category: hexToBin(utxo.token_data!.category!),
                    amount: BigInt(utxo.token_data!.amount),
                    nft: utxo.token_data.nft ? {
                        commitment: hexToBin(utxo.token_data.nft.commitment!),
                        capability: utxo.token_data.nft.capability,
                    } : undefined
                } : undefined
            },
        } as InputTemplate<CompilerBch>
    }

    static getOutput(
        data: BytecodeDataI,
        utxo: UtxoI
    ): OutputTemplate<CompilerBch> {

        // If the utxo does not contain enough sats to pay the fee, create an output with min sats.
        let outputValue = utxo.value > this.EXECUTOR_FEE + 800 ? utxo.value - this.EXECUTOR_FEE : 800n

        return {
            lockingBytecode: data["recipient"]!,
            valueSatoshis: BigInt(outputValue),
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

    static getExecutorOutput(
        cashaddr: string,
        amount: number
    ): OutputTemplate<CompilerBch> {

        let lockingBytecode = cashAddressToLockingBytecode(cashaddr)
        if (typeof lockingBytecode == "string") throw lockingBytecode

        return {
            lockingBytecode: lockingBytecode.bytecode,
            valueSatoshis: BigInt(amount)
        }

    }


    /**
     * Drop expired records.
     *
     * @param jobs[] - a list of locktime records and utxos to execute
     *
     * @throws {Error} if transaction generation fails.
     * @returns a transaction template.
     */

    static execute(
        jobs: LocktimeJob[],
        height: number,
        executorCashaddress?: string,
        fee = 1
    ): {
        transaction: Transaction,
        sourceOutputs: Output[],
        verify: string | boolean
    } {

        const inputs: InputTemplate<CompilerBch>[] = [];
        const outputs: OutputTemplate<CompilerBch>[] = [];
        let sourceOutputs = []


        let config = {
            locktime: height,
            version: 2,
            inputs,
            outputs
        }

        for (let job of jobs) {
            let data = this.parseNFT(job.record)
            // if the job is not in mempool
            if (binToNumberUintLE(data["locktime"]!) <= height) {
                config.inputs.push(this.getInput(data, job.utxo));
                config.outputs.push(this.getOutput(data, job.utxo));
                sourceOutputs.push(this.getSourceOutput(data, job.utxo));
            }
        }

        if (executorCashaddress && config.inputs.length > 0) {
            config.outputs.push(
                this.getExecutorOutput(
                    executorCashaddress,
                    (config.inputs.length * this.EXECUTOR_FEE)
                )
            )
        }

        let result = generateTransaction(config);
        if (!result.success) throw new Error('generate transaction failed!, errors: ' + JSON.stringify(result.errors, null, '  '));

        if (executorCashaddress && config.inputs.length > 0) {
            const estimatedFee = getTransactionFees(result.transaction, fee) + 1n

            const lastIdx = config.outputs.length - 1
            config.outputs[lastIdx]!.valueSatoshis = config.outputs[lastIdx]!.valueSatoshis - estimatedFee
        }

        result = generateTransaction(config);
        if (!result.success) throw new Error('generate transaction failed!, errors: ' + JSON.stringify(result.errors, null, '  '));

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