import {
    bigIntToVmNumber,
    CashAddressNetworkPrefix,
    lockingBytecodeToCashAddress
} from "@bitauth/libauth"

import { Coupon } from './coupon.js'
import Future from  './auth.js'

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
        return Coupon.getLockingBytecode(amount,this.getLockingBytecode(time))
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

}