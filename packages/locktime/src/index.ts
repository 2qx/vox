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
    stringify,
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
    getWalletLayers,
    numToVm,
    UtxoI,
} from '@unspent/tau';

export interface LocktimeData {
    locktime: number,
    recipient: string
}


export type LocktimeJob = {
    record: string | Uint8Array,
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

    static parseCommitment(record: string | Uint8Array): BytecodeDataI {

        if (typeof record === "string") record = hexToBin(record)
        const decodedData = decodePushBytes(record)
        if (binToUtf8(decodedData[0]!) !== this.PROTOCOL_IDENTIFIER) throw Error(`"Non-${typeof this} record NFT passed as ${typeof this}"`)
        return {
            "recipient": decodedData[1]!,
            "locktime": decodedData[2]!,
        }

    }

    static encodeCommitment(data: LocktimeData) {
        const bytecode = this.dataToBytecode(data)
        return binToHex(this.getLockingBytecode(bytecode))
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
        record: string | Uint8Array,
        reversed = true): string {
        return getScriptHash(
            this.getLockingBytecode(this.parseCommitment(record)),
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

    static getDeposit(data: BytecodeDataI, amount: number): OutputTemplate<CompilerBch> {

        return {
            lockingBytecode: {
                data: {
                    "bytecode": data
                },
                compiler: this.compiler,
                script: 'lock'
            },
            valueSatoshis: BigInt(amount),
            //TODO support tokens
        }
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


    static fund(
        amount: number,
        locktime: number,
        lockingBytecode: Uint8Array | string,
        walletUtxos: UtxoI[],
        privateKey?: string,
        fee = 1
    ): {
        transaction: Transaction,
        sourceOutputs: Output[],
        verify: string | boolean
    } {
        const inputs: InputTemplate<CompilerBch>[] = [];
        const outputs: OutputTemplate<CompilerBch>[] = [];
        let sourceOutputs: Output[] = [];

        if (typeof lockingBytecode !== "string") lockingBytecode = binToHex(lockingBytecode)
        let data = this.dataToBytecode(
            {
                "locktime": locktime,
                "recipient": lockingBytecode

            }
        )

        let config = {
            locktime: 0,
            version: 2,
            inputs, outputs,
        }

        // amount
        config.outputs.push(this.getDeposit(data, amount))
        config = getWalletLayers(config, sourceOutputs, walletUtxos, privateKey)

        let result = generateTransaction(config);
        if (!result.success) throw new Error('generate transaction failed!, errors: ' + stringify(result.errors));
        let transaction = result.transaction

        const estimatedFee = getTransactionFees(result.transaction, fee)

        // subtract fees off the change output
        const outIdx = config.outputs.length - 1
        config.outputs[outIdx]!.valueSatoshis = config.outputs[outIdx]!.valueSatoshis - estimatedFee

        result = generateTransaction(config);
        if (!result.success) throw new Error('generate transaction failed!, errors: ' + stringify(result.errors));

        transaction = result.transaction
        const tokenValidationResult = verifyTransactionTokens(
            transaction,
            sourceOutputs,
            { maximumTokenCommitmentLength: 128 }
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


    /**
     * Unlock hodl.
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
            let data = this.parseCommitment(job.record)
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