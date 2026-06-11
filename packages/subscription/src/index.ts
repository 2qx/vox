import template from './template.v3.json' with { type: "json" };
import packageInfo from '../package.json' with { type: "json" };

import {
    binToHex,
    binToUtf8,
    binToNumberUintLE,
    cashAddressToLockingBytecode,
    cashAssemblyToBin,
    CompilerBch,
    createVirtualMachineBch2025,
    generateTransaction,
    hexToBin,
    InputTemplate,
    bigIntToVmNumber,
    OutputTemplate,
    Output,
    Transaction,
    verifyTransactionTokens,
    vmNumberToBigInt
} from '@bitauth/libauth';

import {
    BytecodeDataI,
    getAddress,
    getTransactionFees,
    type CashAddressNetworkPrefix,
    decodePushBytes,
    getAuthLayers,
    getChangeOutput,
    getLibauthCompiler,
    getScriptHash,
    getWalletInput,
    getWalletSourceOutput,
    numToVm,
    sumSourceOutputTokenAmounts,
    sumSourceOutputValue,
    sumOutputValue,
    sumOutputTokenAmounts,
    UtxoI,
    UnspentError
} from '@unspent/tau';


export interface SubscriptionData {
    installment: bigint,
    recipient: Uint8Array,
    period: number,
    auth: Uint8Array
}

export type SubscriptionJob = {
    record: UtxoI,
    utxo: UtxoI
}

export interface SubscriptionRequest {
    asset: Uint8Array;
}

export default class Subscription {

    static USER_AGENT = packageInfo.name;

    static PROTOCOL_IDENTIFIER = "U3S"

    static EXECUTOR_FEE = 5000;

    static tokenAware = true;

    static template = template;

    static compiler: CompilerBch = getLibauthCompiler(this.template);

    static vm = createVirtualMachineBch2025();

    static dataToBytecode(data: SubscriptionData) {
        return {
            "installment": bigIntToVmNumber(data.installment),
            "recipient": data.recipient,
            "period": bigIntToVmNumber(BigInt(data.period)),
            "auth": new Uint8Array(data.auth).reverse(),
        }
    }

    static parseNFT(utxo: UtxoI): BytecodeDataI {

        if (utxo.token_data?.nft?.commitment) {
            let byteData = decodePushBytes(hexToBin(utxo.token_data?.nft?.commitment))
            if (binToUtf8(byteData[0]!) !== this.PROTOCOL_IDENTIFIER) throw Error("Non-subscription record NFT passed as subscription")
            return {
                "installment": byteData[1]!,
                "recipient": byteData[2]!,
                "period": byteData[3]!,
                "auth": hexToBin(utxo.token_data.category)
            }

        } else {
            throw Error("Could not parse subscription NFT")
        }
    }

    static encodeCommitment(data: SubscriptionData) {
        let commitment = cashAssemblyToBin(
            `<"${this.PROTOCOL_IDENTIFIER}"><${data.installment}><0x${binToHex(data.recipient)}><${data.period}>`)
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

    static getUnlockingBytecode(
        data: BytecodeDataI
    ): Uint8Array {
        const bytecodeResult = this.compiler.generateBytecode(
            {
                data: {
                    "bytecode": data
                },
                scriptId: 'execute'
            })
        if (!bytecodeResult.success) throw new Error(
            'Failed to generate bytecode, script: , ' + JSON.stringify(bytecodeResult, null, '  '
            ));
        return bytecodeResult.bytecode
    }

    /**
     * Get getScriptHash
     *
     * @param data - a utxo parameters of the subscription.
     * @param reversed - whether to reverse the hash.
     * @throws {Error} if transaction generation fails.
     * @returns a cashaddress.
     */
    static getScriptHash(
        data: SubscriptionData,
        reversed = true
    ): string {
        let bytecodeData = this.dataToBytecode(data)
        return getScriptHash(
            this.getLockingBytecode(bytecodeData),
            reversed
        )
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
    ): string {
        throw Error(UnspentError.NoCashAddrForp2s)
    }

    static getSourceOutput(
        data: BytecodeDataI,
        utxo: UtxoI
    ): Output {

        return {
            lockingBytecode: this.getLockingBytecode(data),
            valueSatoshis: BigInt(utxo.value),
            token: utxo.token_data ? {
                category: hexToBin(utxo.token_data.category!),
                amount: BigInt(utxo.token_data.amount),
                // nft: utxo.token_data.nft ? {
                //     commitment: hexToBin(utxo.token_data.nft.commitment!),
                //     capability: utxo.token_data.nft.capability,
                // } : undefined
            } : undefined
        } as Output

    }

    static getInput(
        data: BytecodeDataI,
        utxo: UtxoI,
        age: number
    ): InputTemplate<CompilerBch> {
        return {
            outpointIndex: utxo.tx_pos,
            outpointTransactionHash: hexToBin(utxo.tx_hash),
            sequenceNumber: age,
            unlockingBytecode: {
                data: {
                    "bytecode": data
                },
                compiler: this.compiler,
                script: 'execute',
                valueSatoshis: BigInt(utxo.value),
                token: utxo.token_data ? {
                    category: hexToBin(utxo.token_data!.category!),
                    amount: BigInt(utxo.token_data!.amount),
                    // nft: utxo.token_data.nft ? {
                    //     commitment: hexToBin(utxo.token_data.nft.commitment!),
                    //     capability: utxo.token_data.nft.capability,
                    // } : undefined
                } : undefined
            },
        } as InputTemplate<CompilerBch>
    }

    static getInstallmentOutput(
        data: BytecodeDataI,
        utxo: UtxoI
    ): OutputTemplate<CompilerBch> {


        let installment = vmNumberToBigInt(data["installment"]!)
        if (typeof installment === 'string') throw installment


        // If the subscription has more than one installment left...
        if (BigInt(utxo.token_data?.amount!) < installment) {
            installment = BigInt(utxo.token_data?.amount!)
        }

        // otherwise, liquidate the remaining tokens
        return {
            lockingBytecode: data["recipient"]!,
            valueSatoshis: 800n,
            token: utxo.token_data ? {
                category: hexToBin(utxo.token_data!.category!),
                amount: installment
            } : undefined
        }
    }

    static getReturnOutput(
        data: BytecodeDataI,
        utxo: UtxoI
    ): OutputTemplate<CompilerBch> {


        let installment = vmNumberToBigInt(data["installment"]!)
        if (typeof installment === 'string') throw installment
        return {
            lockingBytecode: {
                data: {
                    "bytecode": data
                },
                compiler: this.compiler,
                script: 'lock'
            },
            valueSatoshis: BigInt(utxo.value - this.EXECUTOR_FEE),
            token: utxo.token_data ? {
                category: hexToBin(utxo.token_data!.category!),
                amount: BigInt(utxo.token_data!.amount) - installment
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

    static getWalletInputs(
        utxos: UtxoI[],
        amount: bigint,
        privateKey?: string,
        category?: Uint8Array | string,
        sourceOutputs: Output[] = []
    ): {
        inputs: InputTemplate<CompilerBch>[],
        outputs: OutputTemplate<CompilerBch>[],
        sourceOutputs: Output[]
    } {

        let inputs: InputTemplate<CompilerBch>[] = [];
        let outputs: OutputTemplate<CompilerBch>[] = [];

        if (category && typeof category !== "string") category = binToHex(category)
        // Only use straight sat utxos if placing Bch
        if (!category) {
            utxos = utxos.filter(u => !u.token_data)
        } else {
            utxos = utxos
                .filter(u => u.token_data && u.token_data?.category == category)
                // Must not contain NFTs
                .filter(u => u.token_data && !u.token_data.nft)
        }

        // TODO: sort by highest value first
        if (utxos.length == 0) throw Error("no wallet utxos left, maximum recursion depth reached.");

        // get a random utxo.
        const randomIdx = Math.floor(Math.random() * utxos.length)
        const randomUtxo = utxos[randomIdx]!

        // remove the random utxo in place
        utxos.splice(randomIdx, 1);

        // spend the utxo
        inputs.push(getWalletInput(randomUtxo, privateKey))
        sourceOutputs.push(getWalletSourceOutput(randomUtxo, privateKey));
        let sumSats = sumSourceOutputValue(sourceOutputs)
        let sumTokenAmounts = sumSourceOutputTokenAmounts(sourceOutputs, category)
        if (
            // collecting tokens, but the amount is not sufficient
            (category && sumTokenAmounts < amount) ||
            // or collecting sats and not enough sats inputs 
            (!category && sumSats < amount)
        ) {
            // to it again
            let nextTry = this.getWalletInputs(
                [...utxos],
                amount,
                privateKey,
                category,
                [...sourceOutputs]
            )
            inputs.push(...nextTry.inputs)
            outputs.push(...nextTry.outputs)
            sourceOutputs = nextTry.sourceOutputs
        }
        return { inputs, outputs, sourceOutputs }
    }

    static getWalletLayers(
        assetCat: Uint8Array | string,
        config: {
            locktime: number;
            version: number;
            inputs: InputTemplate<CompilerBch>[];
            outputs: OutputTemplate<CompilerBch>[];
        },
        sourceOutputs: Output[],
        walletUtxos: UtxoI[],
        privateKey?: string,
    ) {
        // Calculate excess cash and tokens required to fund the exchange
        let sumSatsOut = sumOutputValue(config.outputs)
        let sumSatsIn = sumSourceOutputValue(sourceOutputs)
        let satsRequired = sumSatsOut - sumSatsIn

        const satsIn = this.getWalletInputs(walletUtxos, satsRequired, privateKey)
        config.inputs.push(...satsIn.inputs);
        sourceOutputs.push(...satsIn.sourceOutputs);


        let sumTokenAmountsOut = sumOutputTokenAmounts(config.outputs, assetCat)
        let sumTokenAmountsIn = sumSourceOutputTokenAmounts(sourceOutputs, assetCat)
        let tokensRequired = sumTokenAmountsOut - sumTokenAmountsIn

        if (tokensRequired > 0n) {
            const tokensIn = this.getWalletInputs(walletUtxos, tokensRequired, privateKey, assetCat)
            config.inputs.push(...tokensIn.inputs);
            sourceOutputs.push(...tokensIn.sourceOutputs);
        }


        // Calculate excess cash and tokens to be returned as change
        sumSatsOut = sumOutputValue(config.outputs)
        sumSatsIn = sumSourceOutputValue(sourceOutputs)
        let cashChange = sumSatsIn - sumSatsOut
        sumTokenAmountsOut = sumOutputTokenAmounts(config.outputs, assetCat)
        sumTokenAmountsIn = sumSourceOutputTokenAmounts(sourceOutputs, assetCat)
        let tokenChange = sumTokenAmountsIn - sumTokenAmountsOut

        if (tokenChange > 0) {
            config.outputs.push(getChangeOutput(800n, tokenChange, assetCat, privateKey))
            cashChange -= 800n
        }
        config.outputs.push(getChangeOutput(cashChange, 0n, undefined, privateKey))

        return config
    }


    // static setBlackBoardLayers(
    //     authCat: Uint8Array | string,
    //     assetCat: Uint8Array | string,
    //     utxos: UtxoI[],
    //     orders: SubscriptionRequest[],
    //     sourceOutputs: Output[] = []
    // ): {
    //     inputs: InputTemplate<CompilerBch>[],
    //     outputs: OutputTemplate<CompilerBch>[],
    //     sourceOutputs: Output[]
    // } {
    //     let inputs: InputTemplate<CompilerBch>[] = [];
    //     let outputs: OutputTemplate<CompilerBch>[] = [];

    //     inputs.push(...utxos.map(u => this.getInput(authCat, assetCat, u)))
    //     sourceOutputs.push(...utxos.map(u => this.getSourceOutput(authCat, assetCat, u)))
    //     outputs.push(...orders.map(o => this.orderRequestToOutputs(authCat, assetCat, o)).flat())
    //     return { inputs, outputs, sourceOutputs }
    // }

    /**
     * Pay a monthly subscription installment.
     *
     * @param record - The utxo recording the subscription
     * @param utxo - The output with the subscription principal
     *
     * @throws {Error} if transaction generation fails.
     * @returns a transaction template.
     */

    static execute(
        jobs: SubscriptionJob[],
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
            locktime: 0,
            version: 2,
            inputs,
            outputs
        }

        // add sources, inputs, and installment outputs to the config
        for (let job of jobs) {
            let data = this.parseNFT(job.record)
            // if the job is not in mempool
            if (job.utxo.height > 0 && job.utxo.value > 5800) {
                const age = height - job.utxo.height
                const period = binToNumberUintLE(data['period']!)
                const installment = vmNumberToBigInt(data["installment"]!)
                if (typeof installment === "string") throw installment
                // if the subscription is ready to be processed
                if (age >= period && BigInt(job.utxo.token_data?.amount!) >= installment) {
                    config.inputs.push(this.getInput(data, job.utxo, age));
                    config.outputs.push(this.getInstallmentOutput(data, job.utxo));
                    sourceOutputs.push(this.getSourceOutput(data, job.utxo));
                }
            }
        }

        // add principal return outputs
        for (let job of jobs) {
            let data = this.parseNFT(job.record)
            // if the job is not in mempool
            if (job.utxo.height > 0 && job.utxo.value > 5800) {
                const age = height - job.utxo.height
                const period = binToNumberUintLE(data['period']!)
                const installment = vmNumberToBigInt(data["installment"]!)
                if (typeof installment === "string") throw installment
                // if the subscription is ready to be processed
                if (age >= period && BigInt(job.utxo.token_data?.amount!) >= installment) {
                    config.outputs.push(this.getReturnOutput(data, job.utxo));
                }
            }
        }

        // cash out subscriptions below the installment threshold.
        for (let job of jobs) {
            let data = this.parseNFT(job.record)
            // if the job is not in mempool
            if (job.utxo.height > 0 && job.utxo.value > 5800) {
                const age = height - job.utxo.height
                const period = binToNumberUintLE(data['period']!)
                const installment = vmNumberToBigInt(data["installment"]!)
                if (typeof installment === "string") throw installment

                // if the subscription is ready to be processed
                if (age >= period && BigInt(job.utxo.token_data?.amount!) < installment) {
                    config.inputs.push(this.getInput(data, job.utxo, age));
                    config.outputs.push(this.getInstallmentOutput(data, job.utxo));
                    sourceOutputs.push(this.getSourceOutput(data, job.utxo));
                }
            }
        }


        if (executorCashaddress && config.inputs.length > 0) {
            config.outputs.push(
                this.getExecutorOutput(
                    executorCashaddress,
                    (config.inputs.length * (this.EXECUTOR_FEE - 800))
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



    /**
     * Administer Subscription
     * 
     * Create, renew, or withdraw assets from a contract.
     * 
     * To create an exchange, specify a list of new subscription against an empty contract utxo state.
     * 
     * To renew the orders on an existing exchange, provide the complete list of 
     * current contract utxos and the desired new order state.
     * 
     * To withdraw, specify the current utxos without new orders.
     *
     * @param assetCat - Category of the asset traded
     * @param authUtxo - Exchange authentication (minting) baton
     * @param contractUtxos - Current utxo state.  
     * @param walletUtxos - wallet outputs to use as input.
     * @param privateKey - private key to sign transaction wallet inputs.
     * @param fee - transaction fee to pay (per byte).
     *
     * @throws {Error} if transaction generation fails.
     * @returns a transaction template.
     */

    static administer(
        authUtxo: UtxoI,
        assetCat: Uint8Array | string,
        //@ts-ignore
        contractUtxos: UtxoI[],
        walletUtxos: UtxoI[],
        privateKey?: string,
        addressIndex = 0,
        fee = 1
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

        let authCat = authUtxo.token_data!.category

        // Build authentication baton layer
        const authLayers = getAuthLayers(authUtxo, privateKey, addressIndex)
        config.inputs.push(...authLayers.inputs);
        config.outputs.push(...authLayers.outputs);
        let sourceOutputs = authLayers.sourceOutputs;

        // const threadLayers = this.setThreadLayers(authCat, assetCat, contractUtxos)
        // config.inputs.push(...threadLayers.inputs);
        // config.outputs.push(...threadLayers.outputs);
        // sourceOutputs.push(...threadLayers.sourceOutputs);

        config = this.getWalletLayers(assetCat, config, sourceOutputs, walletUtxos, privateKey)

        let result = generateTransaction(config);
        if (!result.success) throw new Error('generate transaction failed!, errors: ' + JSON.stringify(result.errors, null, '  '));

        const estimatedFee = getTransactionFees(result.transaction, fee)

        const lastIdx = config.outputs.length - 1
        config.outputs[lastIdx]!.valueSatoshis = config.outputs[lastIdx]!.valueSatoshis - estimatedFee

        result = generateTransaction(config);
        if (!result.success) throw new Error('generate transaction failed!, errors: ' + JSON.stringify(result.errors, null, '  '));

        const transaction = result.transaction

        const tokenValidationResult = verifyTransactionTokens(
            transaction,
            sourceOutputs,
            { maximumTokenCommitmentLength: 40 }
        );
        if (tokenValidationResult !== true && fee > 0) throw tokenValidationResult;

        let verify = this.vm.verify({
            sourceOutputs: sourceOutputs,
            transaction: transaction,
        })
        if (typeof verify == "string") throw Error(verify)


        let feeEstimate = sumSourceOutputValue(sourceOutputs) - sumSourceOutputValue(transaction.outputs)
        if (feeEstimate > estimatedFee + 10n) verify = `Excessive fees: ${feeEstimate} for ${estimatedFee} byte tx`
        if (sumSourceOutputTokenAmounts(sourceOutputs, assetCat) == 0n) verify = `Error checking token input`
        let tokenDiff = sumSourceOutputTokenAmounts(sourceOutputs, assetCat) -
            sumSourceOutputTokenAmounts(
                transaction.outputs,
                assetCat
            )
        if (tokenDiff !== 0n) verify = `Swapping should not create destroy tokens, token difference: ${tokenDiff}`

        return {
            sourceOutputs: sourceOutputs,
            transaction: transaction,
            verify: verify
        }
    }
}