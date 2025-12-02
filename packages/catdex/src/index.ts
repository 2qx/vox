import template from './template.v3.json' with { type: "json" };
import packageInfo from '../package.json' with { type: "json" };

import {
    binToHex,
    bigIntToVmNumber,
    CompilerBch,
    createVirtualMachineBch,
    deriveHdPublicKey,
    encodeTransactionBch,
    generateTransaction,
    hdPrivateKeyToP2pkhLockingBytecode,
    hexToBin,
    InputTemplate,
    OutputTemplate,
    Output,
    padMinimallyEncodedVmNumber,
    swapEndianness,
    Transaction,
    verifyTransactionTokens,
    vmNumberToBigInt,
    stringify
} from '@bitauth/libauth';

import {
    getAddress,
    type CashAddressNetworkPrefix,
    getLibauthCompiler,
    getScriptHash,
    getTransactionFees,
    UtxoI,
    sumSourceOutputTokenAmounts,
    sumSourceOutputValue,
    sumOutputValue,
    sumOutputTokenAmounts
} from '@unspent/tau';

const PRICE_MULTIPLIER = 100_000_000


export interface OrderRequest {
    amount: bigint;
    price: bigint;
}


export interface CatDexOrder {
    authCategory: Uint8Array;
    assetCategory: Uint8Array;
    orderUtxo: UtxoI;
    assetUtxo: UtxoI;
    price: number;
    quantity: number;
    value: bigint;
    amount: bigint;
}




export default class CatDex {

    static USER_AGENT = packageInfo.name;

    static PROTOCOL_IDENTIFIER = "U3X";

    static tokenAware = true;

    static template = template;

    static compiler: CompilerBch = getLibauthCompiler(this.template);

    static vm = createVirtualMachineBch();


    static getLockingBytecode(
        authCat: Uint8Array | string,
        assetCat: Uint8Array | string): Uint8Array {
        if (typeof authCat == "string") authCat = hexToBin(swapEndianness(authCat))
        if (typeof assetCat == "string") assetCat = hexToBin(swapEndianness(assetCat))
        const lockingBytecodeResult = this.compiler.generateBytecode(
            {
                data: {
                    "bytecode": {
                        "auth_category": authCat,
                        "asset_category": assetCat
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
     * Get ScriptHash
     *
     * @param authCat - the authentication category
     * @param assetCat - the asset category
     * @param reversed - whether to reverse the hash.
     * @throws {Error} if transaction generation fails.
     * @returns a scripthash.
     */
    static getScriptHash(
        authCat: Uint8Array | string,
        assetCat: Uint8Array | string,
        reversed = true
    ): string {
        return getScriptHash(this.getLockingBytecode(authCat, assetCat), reversed)
    }


    /**
     * Get cashaddress
     *
     * @param authCat - the authentication category
     * @param assetCat - the asset category
     * @param prefix - cashaddress prefix.
     * @throws {Error} if transaction generation fails.
     * @returns a cashaddress.
     */
    static getAddress(
        authCat: Uint8Array | string,
        assetCat: Uint8Array | string,
        prefix = "bitcoincash" as CashAddressNetworkPrefix): string {
        return getAddress(this.getLockingBytecode(authCat, assetCat), prefix, this.tokenAware)
    }


    static getSourceOutput(
        authCat: Uint8Array | string,
        assetCat: Uint8Array | string,
        utxo: UtxoI
    ): Output {

        return {
            lockingBytecode: this.getLockingBytecode(authCat, assetCat),
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


    /**
     * Parse nft commitment
     *
     * @param commitment - nft commitment
     * @returns an order.
     */
    static parseNFT(commitment: Uint8Array): OrderRequest {


        let amount = vmNumberToBigInt(commitment.slice(0, 16)!, { requireMinimalEncoding: false })
        let price = vmNumberToBigInt(commitment.slice(-16)!, { requireMinimalEncoding: false })
        return {
            amount: BigInt(amount),
            price: BigInt(price)
        }

    }

    /**
     * Encode an order on for an nft commitment
     *
     * @param commitment - nft commitment
     * @returns the new commitment as a 32-byte order data.
     */
    static encodeNFT(order: OrderRequest): Uint8Array {
        return new Uint8Array(
            [
                ...padMinimallyEncodedVmNumber(bigIntToVmNumber(order.amount), 16),
                ...padMinimallyEncodedVmNumber(bigIntToVmNumber(order.price), 16)
            ]
        )
    }

    static getInput(
        authCat: Uint8Array | string,
        assetCat: Uint8Array | string,
        utxo: UtxoI
    ): InputTemplate<CompilerBch> {
        if (typeof authCat == "string") authCat = hexToBin(swapEndianness(authCat))
        if (typeof assetCat == "string") assetCat = hexToBin(swapEndianness(assetCat))
        return {
            outpointIndex: utxo.tx_pos,
            outpointTransactionHash: hexToBin(utxo.tx_hash),
            sequenceNumber: 0,
            unlockingBytecode: {
                data: {
                    "bytecode": {
                        "auth_category": authCat,
                        "asset_category": assetCat
                    }
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
        authCat: Uint8Array | string,
        assetCat: Uint8Array | string,
        utxo: UtxoI,
        amount: bigint
    ): OutputTemplate<CompilerBch> {

        return {
            lockingBytecode: this.getLockingBytecode(authCat, assetCat),
            valueSatoshis: BigInt(utxo.value) + amount,
            token: {
                category: hexToBin(utxo.token_data!.category!),
                amount: BigInt(utxo.token_data?.amount!) - BigInt(amount)
            }
        }

    }


    static orderRequestToOutputs(
        authCat: Uint8Array | string,
        assetCat: Uint8Array | string,
        order: OrderRequest
    ): OutputTemplate<CompilerBch>[] {

        let lockingBytecode = this.getLockingBytecode(authCat, assetCat)

        if (typeof authCat == "string") authCat = hexToBin(authCat)
        if (typeof assetCat == "string") assetCat = hexToBin(assetCat)

        let cashReserves = 800n;
        let tokenReserves = 0n;

        if (order.amount < 0) cashReserves += BigInt(order.price * -order.amount)
        if (order.amount > 0) tokenReserves += BigInt(order.amount)

        const orderCommitment = this.encodeNFT(order)

        return [
            {
                lockingBytecode: lockingBytecode,
                valueSatoshis: cashReserves,
                token: {
                    category: authCat,
                    amount: 0n,
                    nft: {
                        commitment: orderCommitment,
                        capability: 'mutable'
                    }

                }
            },
            {
                lockingBytecode: this.getLockingBytecode(authCat, assetCat),
                valueSatoshis: 800n,
                token: {
                    category: assetCat,
                    amount: tokenReserves
                }
            }
        ]
    }


    static getWalletSourceOutput(utxo: UtxoI, key?: string, addressIndex = 0): Output {

        const lockingBytecode = key ? hdPrivateKeyToP2pkhLockingBytecode({
            addressIndex: addressIndex,
            hdPrivateKey: key,
            throwErrors: true
        }) : Uint8Array.from(Array(33))


        return {
            lockingBytecode: lockingBytecode,
            valueSatoshis: BigInt(utxo.value),
            token: utxo.token_data ? {
                category: hexToBin(utxo.token_data!.category!),
                amount: BigInt(utxo.token_data!.amount!),
                nft: utxo.token_data.nft ? {
                    commitment: hexToBin(utxo.token_data.nft.commitment!),
                    capability: utxo.token_data.nft.capability,
                } : undefined
            } : undefined
        }

    }


    static getWalletInput(utxo: UtxoI, privateKey?: string, addressIndex = 0): InputTemplate<CompilerBch> {

        let unlockingData = privateKey ? {
            compiler: this.compiler,
            data: {
                hdKeys: {
                    addressIndex: addressIndex,
                    hdPrivateKeys: {
                        'wallet': privateKey
                    },
                }
            },
            script: 'wallet_unlock',
            valueSatoshis: BigInt(utxo.value),
            token: utxo.token_data ? {
                category: hexToBin(utxo.token_data.category!),
                amount: BigInt(utxo.token_data.amount),
                nft: utxo.token_data.nft ? {
                    commitment: hexToBin(utxo.token_data.nft.commitment!),
                    capability: utxo.token_data.nft.capability,
                } : undefined
            } : undefined
        } : Uint8Array.from(Array())

        return {
            outpointIndex: utxo.tx_pos,
            outpointTransactionHash: hexToBin(utxo.tx_hash),
            sequenceNumber: 0,
            unlockingBytecode: unlockingData,
        } as InputTemplate<CompilerBch>
    }

    static getAuthWalletOutput(
        utxo: UtxoI,
        privateKey?: any,
        addressIndex = 0,
    ): OutputTemplate<CompilerBch> {

        const lockingBytecode = privateKey ? {
            compiler: this.compiler,
            data: {
                hdKeys: {
                    addressIndex: addressIndex,
                    hdPublicKeys: {
                        'wallet': deriveHdPublicKey(privateKey).hdPublicKey
                    },
                },
            },
            script: 'wallet_lock'
        } : Uint8Array.from(Array(33))

        return {
            lockingBytecode: lockingBytecode,
            valueSatoshis: BigInt(utxo.value),
            token: utxo.token_data ? {
                category: hexToBin(utxo.token_data!.category!),
                amount: BigInt(utxo.token_data.amount),
                nft: utxo.token_data.nft ? {
                    commitment: hexToBin(utxo.token_data.nft.commitment!),
                    capability: utxo.token_data.nft.capability,
                } : undefined
            } : undefined
        }
    }

    static getChangeOutput(
        value: bigint,
        amount: bigint,
        category?: Uint8Array | string,
        privateKey?: any,
        addressIndex = 0
    ): OutputTemplate<CompilerBch> {
        if (category && typeof category !== "string") category = binToHex(category);
        const lockingBytecode = privateKey ? {
            compiler: this.compiler,
            data: {
                hdKeys: {
                    addressIndex: addressIndex,
                    hdPublicKeys: {
                        'wallet': deriveHdPublicKey(privateKey).hdPublicKey
                    },
                },
            },
            script: 'wallet_lock'
        } : Uint8Array.from(Array(33))

        return {
            lockingBytecode: lockingBytecode,
            valueSatoshis: value,
            token: amount > 0 && category ? {
                category: hexToBin(category),
                amount: amount,
            } : undefined
        }
    }




    static getAuthLayers(
        authUtxo: UtxoI,
        privateKey?: any,
        addressIndex = 0,
    ): {
        inputs: InputTemplate<CompilerBch>[],
        outputs: OutputTemplate<CompilerBch>[],
        sourceOutputs: Output[]
    } {
        let inputs: InputTemplate<CompilerBch>[] = [];
        let outputs: OutputTemplate<CompilerBch>[] = [];
        let sourceOutputs: Output[] = []

        sourceOutputs.push(this.getWalletSourceOutput(authUtxo, privateKey, addressIndex));
        inputs.push(this.getWalletInput(authUtxo, privateKey, addressIndex))
        outputs.push(this.getAuthWalletOutput(authUtxo, privateKey, addressIndex))
        return { inputs, outputs, sourceOutputs }
    }

    static setBlackBoardLayers(
        authCat: Uint8Array | string,
        assetCat: Uint8Array | string,
        utxos: UtxoI[],
        orders: OrderRequest[],
        sourceOutputs: Output[] = []
    ): {
        inputs: InputTemplate<CompilerBch>[],
        outputs: OutputTemplate<CompilerBch>[],
        sourceOutputs: Output[]
    } {
        let inputs: InputTemplate<CompilerBch>[] = [];
        let outputs: OutputTemplate<CompilerBch>[] = [];

        inputs.push(...utxos.map(u => this.getInput(authCat, assetCat, u)))
        sourceOutputs.push(...utxos.map(u => this.getSourceOutput(authCat, assetCat, u)))
        outputs.push(...orders.map(o => this.orderRequestToOutputs(authCat, assetCat, o)).flat(1))
        return { inputs, outputs, sourceOutputs }
    }

    static getBlackBoardLayers(
        orders: CatDexOrder[],
        amount: bigint,
        sourceOutputs: Output[] = []
    ): {
        inputs: InputTemplate<CompilerBch>[],
        outputs: OutputTemplate<CompilerBch>[],
        sourceOutputs: Output[]
    } {

        let inputs: InputTemplate<CompilerBch>[] = [];
        let outputs: OutputTemplate<CompilerBch>[] = [];

        // Filter available orders to match direction of trade
        orders.filter(o => Math.sign(Number(o.amount)) == Math.sign(Number(amount)))

        // Check if we still have a market
        if (orders.length == 0) throw Error("no orders left, maximum recursion depth reached.");

        const sortFn = amount > 0 ?
            ((a: CatDexOrder, b: CatDexOrder) => a.price - b.price) :
            ((a: CatDexOrder, b: CatDexOrder) => a.price + b.price)

        // sort orders by price
        orders.sort(sortFn)

        // pop the best order
        const best = orders.shift()!

        // Load the order threads
        inputs.push(
            this.getInput(best.authCategory, best.assetCategory, best.orderUtxo)
        )
        sourceOutputs.push(
            this.getSourceOutput(best.authCategory, best.assetCategory, best.orderUtxo)
        );

        // Load the asset threads
        inputs.push(
            this.getInput(best.authCategory, best.assetCategory, best.assetUtxo)
        )
        sourceOutputs.push(
            this.getSourceOutput(best.authCategory, best.assetCategory, best.assetUtxo)
        );

        // if the best order can satisfy the quantity requested token amount
        if (best.amount < amount) {
            outputs.push(
                this.getOutput(best.authCategory, best.assetCategory, best.assetUtxo, amount)
            )
            outputs.push(
                this.getOutput(best.authCategory, best.assetCategory, best.assetUtxo, amount)
            )
        } else {
            if (amount < 0 && amount < -(best.amount!)) {
                // liquidate the best order
                outputs.push(this.getOutput(best.authCategory, best.assetCategory, best.assetUtxo, -amount))
                amount += best.amount
            }
            // and try again
            let nextTry = this.getBlackBoardLayers([...orders], amount, [...sourceOutputs])
            inputs.push(...nextTry.inputs)
            outputs.push(...nextTry.outputs)
            sourceOutputs = nextTry.sourceOutputs
        }
        return { inputs, outputs, sourceOutputs }
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
            utxos = utxos.filter(u => u.token_data && u.token_data?.category == category)
        }

        // TODO: sort by highest value first
        if (utxos.length == 0) throw Error("no wallet utxos left, maximum recursion depth reached.");

        // get a random utxo.
        const randomIdx = Math.floor(Math.random() * utxos.length)
        const randomUtxo = utxos[randomIdx]!

        // remove the random utxo in place
        utxos.splice(randomIdx, 1);

        // spend the utxo
        inputs.push(this.getWalletInput(randomUtxo, privateKey))
        sourceOutputs.push(this.getWalletSourceOutput(randomUtxo, privateKey));
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

        let sumTokenAmountsOut = sumOutputTokenAmounts(config.outputs, assetCat)
        let sumTokenAmountsIn = sumSourceOutputTokenAmounts(sourceOutputs, assetCat)
        let tokensRequired = sumTokenAmountsOut - sumTokenAmountsIn


        const satsIn = this.getWalletInputs(walletUtxos, satsRequired, privateKey)
        const tokensIn = this.getWalletInputs(walletUtxos, tokensRequired, privateKey, assetCat)

        config.inputs.push(...satsIn.inputs);
        sourceOutputs.push(...satsIn.sourceOutputs);
        config.inputs.push(...tokensIn.inputs);
        sourceOutputs.push(...tokensIn.sourceOutputs);

        // Calculate excess cash and tokens to be returned as change
        sumSatsOut = sumOutputValue(config.outputs)
        sumSatsIn = sumSourceOutputValue(sourceOutputs)
        let cashChange = sumSatsIn - sumSatsOut
        sumTokenAmountsOut = sumOutputTokenAmounts(config.outputs, assetCat)
        sumTokenAmountsIn = sumSourceOutputTokenAmounts(sourceOutputs, assetCat)
        let tokenChange = sumTokenAmountsIn - sumTokenAmountsOut

        if (tokenChange > 0) {
            config.outputs.push(this.getChangeOutput(800n, tokenChange, assetCat, privateKey))
            cashChange -= 800n
        }
        config.outputs.push(this.getChangeOutput(cashChange, 0n, undefined, privateKey))

        return config
    }

    /**
     * Administer CatDex Blackboard
     * 
     * Create, rebalance, or withdraw assets from a contract.
     * 
     * To create an exchange, specify a list of new orders against an empty contract utxo state.
     * 
     * To rebalance the orders on an existing exchange, provide the complete list of 
     * current contract utxos and the desired new order state.
     * 
     * To withdraw, specify the current utxos without new orders.
     *
     * @param assetCat - Category of the asset traded
     * @param authUtxo - Exchange authentication (minting) baton
     * @param contractUtxos - Current utxo state.  
     * @param orders - List of next desired order state. 
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
        contractUtxos: UtxoI[],
        orders: OrderRequest[],
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
        const authLayers = this.getAuthLayers(authUtxo, privateKey, addressIndex)
        config.inputs.push(...authLayers.inputs);
        config.outputs.push(...authLayers.outputs);
        let sourceOutputs = authLayers.sourceOutputs;

        const blackBoardLayers = this.setBlackBoardLayers(authCat, assetCat, contractUtxos, orders)
        config.inputs.push(...blackBoardLayers.inputs);
        config.outputs.push(...blackBoardLayers.outputs);
        sourceOutputs.push(...blackBoardLayers.sourceOutputs);

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

        let feeEstimate = sumSourceOutputValue(sourceOutputs) - sumSourceOutputValue(transaction.outputs)
        if (feeEstimate > 5000) verify = `Excessive fees ${feeEstimate}`
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

    /**
     * Swap
     * 
     * Build a transaction (with best execution) for the given amount of tokens.
     * 
     * Buy tokens by specifying a positive amount, and a negative amount to sell.
     * 
     * 
     *
     * @param amount - token amount to buy, negative (-) to sell.
     * @param catDexOrders - A multi-exchange list of available catdex orders.
     * @param walletUtxos - wallet outputs to use as input.
     * @param privateKey - private key to sign transaction wallet inputs.
     * @param fee - transaction fee to pay (per byte).
     *
     * @throws {Error} if transaction generation fails.
     * @returns a transaction template.
     */

    static swap(
        amount: bigint,
        catDexOrders: CatDexOrder[],
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

        let sourceOutputs: Output[] = []

        let authCat = catDexOrders[0]!.orderUtxo.token_data?.category!
        let assetCat = catDexOrders[0]!.assetUtxo.token_data?.category!


        let config = {
            locktime: 0,
            version: 2,
            inputs,
            outputs
        }

        // if selling tokens for Bch for WBch, don't use utxos with tokens
        walletUtxos = walletUtxos.filter(u => u.token_data!.category == assetCat || !u.token_data)

        let vaultLayers = this.getBlackBoardLayers(
            catDexOrders,
            amount,
            sourceOutputs
        );
        config.inputs.push(...vaultLayers.inputs);
        config.outputs.push(...vaultLayers.outputs);
        sourceOutputs = vaultLayers.sourceOutputs;

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

        let feeEstimate = sumSourceOutputValue(sourceOutputs) - sumSourceOutputValue(transaction.outputs)
        if (feeEstimate > 5000) verify = `Excessive fees ${feeEstimate}`
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