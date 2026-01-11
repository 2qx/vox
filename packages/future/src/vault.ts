import packageInfo from '../package.json' with { type: "json" };

import {
    bigIntToVmNumber,
    binToHex,
    CompilerBch,
    createVirtualMachineBch,
    deriveHdPublicKey,
    generateTransaction,
    hdPrivateKeyToP2pkhLockingBytecode,
    hexToBin,
    hash256,
    InputTemplate,
    OutputTemplate,
    verifyTransactionTokens,
    Output,
    Transaction,
    CashAddressNetworkPrefix,
    lockingBytecodeToCashAddress,
    swapEndianness,
    encodeTransactionBch,
} from "@bitauth/libauth"

import {
    getTransactionFees,
    getScriptHash,
    UtxoI,
    sumSourceOutputValue,
    sumSourceOutputTokenAmounts,
    derivePublicKey
} from '@unspent/tau';

import { COUPON_SERIES, VAULT_SERIES } from "./constant.js";

import template from './template.v2.json' with { type: "json" };

import { getAllUnspentCoupons, getRates, getRateLocale, getFutureBlockDateLocale } from "./util.js";
import { CouponDataI } from "./interface.js";
import { Coupon } from './coupon.js'
import Future from './auth.js'

export class Vault {

    static USER_AGENT = packageInfo.name;

    static tokenAware = true;

    static compiler = Future.compiler;

    static template = template;

    static vm = createVirtualMachineBch();

    locktime: number = 0;

    //static unlockingScript = "c0d3c0d0a06376b17568c0cec0d188c0cdc0c788c0d0c0c693c0d3c0cc939c77"

    /**
     * return the scripthash
     *
     * @param time - block time of the vault lock
     * @param reversed - if the result should be reversed; default (electrumX): true.
     * @returns the double scripthash as a string.
     */
    static getScriptHash(time: number, reversed = true): string {
        return getScriptHash(this.getLockingBytecode(time), reversed)
    }

    /**
     * Return the token address for a Vault
     *
     *
     * @param time - block time of the vault lock
     * @param network - cashaddress network prefix
     */
    static getAddress(time: number, network = CashAddressNetworkPrefix.mainnet, tokenSupport = this.tokenAware) {

        let lockingBytecode = this.getLockingBytecode(time);
        let result = lockingBytecodeToCashAddress({ bytecode: lockingBytecode, prefix: network, tokenSupport: tokenSupport })
        if (typeof result === 'string') throw (result)
        return result.address
    }

    /**
     * Return the coupon for a Vault at specified amount
     *
     *
     * @param amount - the threshold amount (sats) to redeem coupon
     * @param time - block time of the vault lock
     */
    static getCouponAddress(amount: number, time: number, network = CashAddressNetworkPrefix.mainnet) {
        return Coupon.getAddress(
            amount,
            this.getLockingBytecode(time),
            network
        )
    }

    /**
     * Return the coupon for a Vault at specified amount
     *
     *
     * @param amount - the threshold amount (sats) to redeem coupon
     * @param time - block time of the vault lock
     */
    static getCouponScriptHash(amount: number, time: number) {
        return Coupon.getScriptHash(
            amount,
            this.getLockingBytecode(time)
        )
    }

    /**
     * Return the coupon for a Vault at specified amount
     *
     *
     * @param amount - the threshold amount (sats) to redeem coupon
     * @param time - block time of the vault lock
     */
    static getCouponLockingBytecode(amount: number, time: number) {
        return Coupon.getLockingBytecode(amount, this.getLockingBytecode(time))
    }


    /**
     * Return the unlockingBytecode for a Vault
     *
     *
     * @param time - block time of the vault lock
     */
    static getUnlockingBytecode(time: number) {

        const bytecodeResult = this.compiler.generateBytecode({
            data: {
                "bytecode": {
                    "locktime": bigIntToVmNumber(BigInt(time)),
                }
            },
            scriptId: 'vault_unlock',
        })
        if (!bytecodeResult.success) {
            /* c8 ignore next */
            throw new Error('Failed to generate bytecode, script: FutureChan, ' + JSON.stringify(bytecodeResult, null, '  '));
        }
        return bytecodeResult.bytecode.slice(1)
    }

    /**
     * Return the lockingBytecode for a Vault
     *
     *
     * @param time - block time of the vault lock
     */
    static getLockingBytecode(time: number) {
        const bytecodeResult = this.compiler.generateBytecode({
            data: {
                "bytecode": {
                    "locktime": bigIntToVmNumber(BigInt(time)),
                }
            },
            scriptId: 'vault_lock',
        })

        if (!bytecodeResult.success) {
            /* c8 ignore next */
            throw new Error('Failed to generate bytecode, script: , ' + JSON.stringify(bytecodeResult, null, '  '));
        }
        return bytecodeResult.bytecode

    }

    /**
     * Return an array of staggered block times
     *
     *
     * @param startTime - block time of the vault lock
     * @param series - power of 10 to stagger the times
     * @param limit - length of the array to return
     */
    static getSeriesTimes(startTime: number, series = 3, limit = 11) {
        const step = Math.pow(10, series)
        const next = startTime - (startTime % step) + step;
        //@ts-ignore
        return Array.from({ length: limit }, (e, i) => next + (step * i))
    }

    static getAllCouponSeries(startTime: number, seriesTimes?: number[]): Map<string, CouponDataI> {

        if (!seriesTimes) seriesTimes = VAULT_SERIES.map(e => this.getSeriesTimes(startTime - 1000, e, e == 6 ? 4 : undefined)).flat()
        seriesTimes = [...new Set(seriesTimes)]
        let amounts = COUPON_SERIES.map(c => Math.pow(10, c) * 1e8)
        let coupons = amounts.map(amount =>
            seriesTimes.map(
                (time: number) => {
                    let scripthash = Coupon.getScriptHash(
                        amount,
                        this.getLockingBytecode(time)
                    )
                    return {
                        locktime: time,
                        placement: amount,
                        order: Math.log10(amount / 1e8),
                        scripthash: scripthash,
                        lockingBytecode: binToHex(Coupon.getLockingBytecode(amount, this.getLockingBytecode(time)))
                    }
                }
            )
        ).flat()
        var map = new Map();
        coupons.forEach(obj => map.set(obj.scripthash, obj));
        return map;
    }


    /**
     * Return an array coupons for vaults in a series
     *
     *
     * @param electrumClient - an v4 electrum-cash client
     * @param height - the height after which to list coupons.
     * @param locktime - filter to coupons for a single series
     */

    public static async getAllCouponUtxos(electrumClient: any, height: number, seriesTimes?: number[]) {
        let couponSeries = Vault.getAllCouponSeries(height, seriesTimes)
        let allCoupons = await getAllUnspentCoupons(electrumClient, [...couponSeries.keys()])
        allCoupons.forEach((value, key, map) => {
            let cData = couponSeries.get(value.scripthash)
            if (cData) {
                map.set(key,
                    {
                        ...value,
                        ...getRates(height, cData.locktime, Number(value.value), cData.placement),
                        locale: getRateLocale(height, cData.locktime, Number(value.value), cData.placement),
                        ...cData,
                        dateLocale: getFutureBlockDateLocale(height, cData.locktime)
                    }
                )
            }
        })
        return Array.from(allCoupons.values()).sort((a, b) => b.spb! - a.spb!)

    }

    static getSourceOutput(utxo: UtxoI, time: number): Output {

        return {
            lockingBytecode: this.getLockingBytecode(time),
            valueSatoshis: BigInt(utxo.value),
            token: {
                category: hexToBin(utxo.token_data!.category!),
                amount: BigInt(utxo.token_data?.amount!)
            }
        }
    }

    static getCouponSourceOutput(utxo: UtxoI, amount: number, time: number): Output {

        return {
            lockingBytecode: this.getCouponLockingBytecode(amount, time),
            valueSatoshis: BigInt(utxo.value)
        }
    }

    static getInput(utxo: UtxoI, time: number): InputTemplate<CompilerBch> {
        return {
            outpointIndex: utxo.tx_pos,
            outpointTransactionHash: hexToBin(utxo.tx_hash),
            sequenceNumber: 0,
            unlockingBytecode: {
                compiler: this.compiler,
                script: 'vault_unlock',
                data: {
                    "bytecode": {
                        "locktime": bigIntToVmNumber(BigInt(time)),
                    }
                },
                valueSatoshis: BigInt(utxo.value),
                token: utxo.token_data ? {
                    category: hexToBin(utxo.token_data.category!),
                    amount: BigInt(utxo.token_data.amount),
                    nft: utxo.token_data.nft ? {
                        commitment: hexToBin(utxo.token_data.nft.commitment!),
                        capability: utxo.token_data.nft.capability,
                    } : undefined
                } : undefined
            },
        } as InputTemplate<CompilerBch>
    }

    static getCouponInput(utxo: UtxoI, amount: number, time: number): InputTemplate<CompilerBch> {
        return {
            outpointIndex: utxo.tx_pos,
            outpointTransactionHash: hexToBin(utxo.tx_hash),
            sequenceNumber: 0,
            unlockingBytecode: {
                data: {
                    "bytecode": {
                        "amount": bigIntToVmNumber(BigInt(amount)),
                        "lock": this.getLockingBytecode(time),
                    }
                },
                compiler: this.compiler,
                script: 'coupon_unlock',
                valueSatoshis: BigInt(utxo.value),
            },
        } as InputTemplate<CompilerBch>
    }

    static getOutput(utxo: UtxoI, amount: bigint, time: number): OutputTemplate<CompilerBch> {

        return {
            lockingBytecode: {
                compiler: this.compiler,
                data: {
                    "bytecode": {
                        "locktime": bigIntToVmNumber(BigInt(time)),
                    }
                },
                script: 'vault_lock'
            },
            valueSatoshis: BigInt(utxo.value) + amount,
            token: {
                category: hexToBin(utxo.token_data!.category!),
                amount: BigInt(utxo.token_data?.amount!) - BigInt(amount)
            }
        }

    }

    static getWalletSourceOutput(utxo: UtxoI, key?: string): Output {

        const lockingBytecode = key ? hdPrivateKeyToP2pkhLockingBytecode({
            addressIndex: 0,
            hdPrivateKey: key
        }) : Uint8Array.from(Array(33))

        return {
            lockingBytecode: lockingBytecode,
            valueSatoshis: BigInt(utxo.value),
            token: utxo.token_data ? {
                category: hexToBin(utxo.token_data!.category!),
                amount: BigInt(utxo.token_data?.amount!)
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

        } : Uint8Array.from(Array())

        if (utxo.token_data) {
            // @ts-ignore
            unlockingData.token = {
                amount: BigInt(utxo.token_data.amount),
                category: hexToBin(utxo.token_data.category)
            }
        }
        return {
            outpointIndex: utxo.tx_pos,
            outpointTransactionHash: hexToBin(utxo.tx_hash),
            sequenceNumber: 0,
            unlockingBytecode: unlockingData,
        } as InputTemplate<CompilerBch>
    }

    static getFutureOutput(
        amount: bigint,
        category: Uint8Array,
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
            valueSatoshis: 800n,
            token: {
                category: category,
                amount: amount
            }
        }
    }

    static getChangeOutput(
        amount: bigint,
        privateKey?: any,
        addressIndex = 0
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
            valueSatoshis: amount
        }
    }

    static getNewWalletUtxos(
        transaction: Transaction,
        privateKey: string,
        addressIndex = 0
    ): UtxoI[] {


        let lockingBytecode = binToHex(hdPrivateKeyToP2pkhLockingBytecode({hdPrivateKey:privateKey, addressIndex}))
        let txBin = encodeTransactionBch(transaction)
        let newId = swapEndianness(binToHex(hash256(txBin)))
        let copyItems: UtxoI[] = [];
        transaction.outputs.forEach((o, i) => {
            if (binToHex(o.lockingBytecode) == lockingBytecode) {
                copyItems.push({
                    tx_hash: newId,
                    tx_pos: i,
                    value: Number(o.valueSatoshis),
                    token_data: o.token ? {
                        category: binToHex(o.token.category),
                        amount: String(o.token.amount),
                        nft: undefined
                    } : undefined,
                    height: 0
                })
            }
        })
        return copyItems

    }


    static getVaultLayers(
        utxos: UtxoI[],
        amount: number,
        time: number,
        category?: any,
        sourceOutputs: Output[] = []
    ): {
        inputs: InputTemplate<CompilerBch>[],
        outputs: OutputTemplate<CompilerBch>[],
        sourceOutputs: Output[]
    } {

        let inputs: InputTemplate<CompilerBch>[] = [];
        let outputs: OutputTemplate<CompilerBch>[] = [];

        utxos = utxos.filter(u => u.token_data?.category == binToHex(category))
        if (amount < 0) utxos = utxos.filter(u => u.value > 800)
        if (utxos.length == 0) throw Error("no vault utxos left, maximum recursion depth reached.");

        const randomIdx = Math.floor(Math.random() * utxos.length)
        const randomUtxo = utxos[randomIdx]!

        // remove the random utxo in place
        utxos.splice(randomIdx, 1);

        // Try to satisfy the swap with another utxos
        inputs.push(this.getInput(randomUtxo, time))
        sourceOutputs.push(this.getSourceOutput(randomUtxo, time));

        if (
            // Redeeming FBch for Bch and this thread can satisfy the swap
            (amount < 0 && -(randomUtxo?.value) < amount) ||
            (amount > 0 && (BigInt(randomUtxo?.token_data?.amount!) > amount))
        ) {
            outputs.push(this.getOutput(randomUtxo, BigInt(amount), time))
        } else {
            if (amount < 0 && amount < -(randomUtxo?.value! - 800)) {
                // liquidate sats on this utxo 
                outputs.push(this.getOutput(randomUtxo, -BigInt(randomUtxo?.value! - 800), time))
                amount += randomUtxo?.value! - 800
            }
            // and try again
            let nextTry = this.getVaultLayers([...utxos], amount, category, [...sourceOutputs])
            inputs.push(...nextTry.inputs)
            outputs.push(...nextTry.outputs)
            sourceOutputs = nextTry.sourceOutputs
        }
        return { inputs, outputs, sourceOutputs }
    }


    static getCouponLayer(
        utxo: UtxoI,
        amount: number,
        time: number,
        sourceOutputs: Output[] = []
    ): {
        inputs: InputTemplate<CompilerBch>[],
        outputs: OutputTemplate<CompilerBch>[],
        sourceOutputs: Output[]
    } {

        let inputs: InputTemplate<CompilerBch>[] = [];
        let outputs: OutputTemplate<CompilerBch>[] = [];


        // Try to satisfy the swap with another utxos
        inputs.push(this.getCouponInput(utxo, amount, time))
        sourceOutputs.push(this.getCouponSourceOutput(utxo, amount, time));
        return { inputs, outputs, sourceOutputs }
    }

    static getWalletLayers(
        utxos: UtxoI[],
        amount: bigint,
        privateKey?: string,
        category?: any,
        sourceOutputs: Output[] = []
    ): {
        inputs: InputTemplate<CompilerBch>[],
        outputs: OutputTemplate<CompilerBch>[],
        sourceOutputs: Output[],
        utxos: UtxoI[]
    } {

        let inputs: InputTemplate<CompilerBch>[] = [];
        let outputs: OutputTemplate<CompilerBch>[] = [];

        // Only use straight sat utxos if placing Bch
        // if (amount > 0) utxos = utxos.filter(u => !u.token_data)
        // if (amount < 0) utxos = utxos.filter(u => u.token_data?.category == binToHex(category))
        if (utxos.length == 0) throw Error("no wallet utxos left, maximum recursion depth reached.");


        // get a random utxo.)
        const randomUtxo = utxos.shift()!

        // spend the utxo
        inputs.push(this.getWalletInput(randomUtxo, privateKey))
        sourceOutputs.push(this.getWalletSourceOutput(randomUtxo, privateKey));
        let sumSats = sumSourceOutputValue(sourceOutputs)
        let sumWSats = sumSourceOutputTokenAmounts(sourceOutputs, binToHex(category))
        if (
            // Redeeming WBch for Bch, and token amount is sufficient
            (amount < 0 && sumWSats >= -amount) ||
            // Or if placing Bch for WBch, and utxo value is sufficient
            (amount > 0 && sumSats > amount)
        ) {
            // This utxo finally satisfied the swap 
            // There is FBch placed
            if (amount > 0) {
                outputs.push(this.getFutureOutput(amount, category, privateKey, 0))
            }
            if (amount < 0) {
                outputs.push(this.getFutureOutput(
                    sumWSats + amount,
                    category,
                    privateKey,
                    0
                ))
            }

            let satsOut = (sumSats) - (amount + 800n)
            outputs.push(this.getChangeOutput(satsOut, privateKey))
        }
        // Liquidate this utxo and try again
        else {
            let nextTry = this.getWalletLayers(
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
        return { inputs, outputs, sourceOutputs, utxos }
    }

    /**
     * Place (+) or redeem (-) some amount of Future Bch.
     *
     * @param amount     - amount to swap (satoshis), negative to redeem.
     * @param contractUtxo - all contract outputs to use as input.
     * @param walletUtxos - wallet outputs to use as input.
     * @param time - The block time of the future series to swap.
     * @param privateKey - private key to sign transaction wallet inputs.
     * @param fee - transaction fee to pay (per byte).
     *
     * @throws {Error} if transaction generation fails.
     * @returns a transaction template.
     */

    static swap(
        amount: number,
        contractUtxos: UtxoI[],
        walletUtxos: UtxoI[],
        time: number,
        privateKey?: string,
        couponUtxo?: UtxoI,
        fee = 1
    ): {
        transaction: Transaction,
        sourceOutputs: Output[],
        verify: string | boolean,
        walletUtxos: UtxoI[]
    } {

        const inputs: InputTemplate<CompilerBch>[] = [];
        const outputs: OutputTemplate<CompilerBch>[] = [];


        let unique = [...new Set(contractUtxos.map(u => u.token_data?.category))]

        if (unique.length > 1) throw Error("Future vault UTXOs may only contain a single future token series")
        let category = unique.pop()!

        let fbchCat = hexToBin(category)

        let config = {
            locktime: 0,
            version: 2,
            inputs,
            outputs
        }


        // Stash unsuitable utxos holding other assets
        let stashedUtxos = walletUtxos.filter(u => (u.token_data?.category == category))

        // Don't use wallet utxos with other tokens for the swap
        let cashUtxos = walletUtxos.filter(u => !u.token_data)
        let matchingUtxos = walletUtxos.filter(u => u.token_data?.category == category)
        console.log(matchingUtxos.length)
        walletUtxos = [... cashUtxos, ... matchingUtxos]


        let vaultLayers = this.getVaultLayers([...contractUtxos], amount, time, fbchCat);
        config.inputs.push(...vaultLayers.inputs);
        config.outputs.push(...vaultLayers.outputs);
        let sourceOutputs = vaultLayers.sourceOutputs;

        let walletLayers = this.getWalletLayers([...walletUtxos], BigInt(amount), privateKey, fbchCat)
        config.inputs.push(...walletLayers.inputs);
        config.outputs.push(...walletLayers.outputs);
        sourceOutputs.push(...walletLayers.sourceOutputs);
        // unused suitable utxos are returned
        walletUtxos = walletLayers.utxos

        const lastOutputIdx = config.outputs.length - 1

        if (couponUtxo) {
            let couponLayer = this.getCouponLayer(couponUtxo, amount, time)
            config.inputs.push(...couponLayer.inputs);
            // no output back
            sourceOutputs.push(...couponLayer.sourceOutputs);
            config.outputs[lastOutputIdx]!.valueSatoshis = config.outputs[lastOutputIdx]!.valueSatoshis + BigInt(couponUtxo.value)
        }


        let result = generateTransaction(config);
        if (!result.success) throw new Error('tx gen failed, errors: ' + JSON.stringify(result.errors, null, '  '));

        const estimatedFee = getTransactionFees(result.transaction, fee)

        config.outputs[lastOutputIdx]!.valueSatoshis = config.outputs[lastOutputIdx]!.valueSatoshis - estimatedFee

        result = generateTransaction(config);
        if (!result.success) throw new Error('tx gen failed, errors: ' + JSON.stringify(result.errors, null, '  '));

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
        if (sumSourceOutputTokenAmounts(sourceOutputs, category) == 0n) verify = `Error checking token input`
        let tokenDiff = sumSourceOutputTokenAmounts(sourceOutputs, category) -
            sumSourceOutputTokenAmounts(
                transaction.outputs,
                category
            )
        if (tokenDiff !== 0n) verify = `Swapping should not create destroy tokens, token difference: ${tokenDiff}`

        walletUtxos.push(...stashedUtxos)

        walletUtxos.push(...this.getNewWalletUtxos(transaction, privateKey!))

        return {
            sourceOutputs: sourceOutputs,
            transaction: transaction,
            verify: verify,
            walletUtxos: walletUtxos
        }
    }
}