import {
    bigIntToVmNumber,
    binToHex,
    CashAddressNetworkPrefix,
    lockingBytecodeToCashAddress
} from "@bitauth/libauth"

import { COUPON_SERIES, VAULT_SERIES } from "./constant.js";

import { getAllUnspentCoupons, getRates, getRateLocale, getFutureBlockDateLocale } from "./util.js";
import { CouponDataI } from "./interface.js";
import { Coupon } from './coupon.js'
import Future from './auth.js'

export class Vault {

    static compiler = Future.compiler;

    locktime: number = 0;
    //static unlockingScript = "c0d3c0d0a06376b17568c0cec0d188c0cdc0c788c0d0c0c693c0d3c0cc939c77"

    /**
     * Return the token address for a Vault
     *
     *
     * @param time - block time of the vault lock
     * @param network - cashaddress network prefix
     */
    static getAddress(time: number, network = CashAddressNetworkPrefix.mainnet, tokenSupport = true) {

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
    static getCoupon(amount: number, time: number, network = CashAddressNetworkPrefix.mainnet) {
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
    static getSeriesTimes(startTime: number, series = 3, limit = 10) {
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

    public static async getAllCouponUtxos(electrumClient: any, height: number) {
        let couponSeries = Vault.getAllCouponSeries(height)
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

}