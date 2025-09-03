import template from './template.v2.json' with { type: "json" };
import packageInfo from '../package.json' with { type: "json" };

import {
  bigIntToVmNumber,
  binToHex,
  CashAddressNetworkPrefix,
  createVirtualMachineBCH,
  encodeDataPush,
  hash256,
  hexToBin,
  lockingBytecodeToCashAddress,
} from "@bitauth/libauth";
import { getScriptHash } from "@unspent/tau";
import Future from './auth.js'


export class Coupon {

  static USER_AGENT = packageInfo.name;

  static tokenAware = false;

  static template = template;

  static vm = createVirtualMachineBCH();

  static compiler = Future.compiler;

  amount: number = 1000000;
  lock: Uint8Array = new Uint8Array(0);

  static unlockingScript = "00cc00c694a16900c788c08bc39c"

  /**
   * Return the scripthash for a Coupon
   *
   *
   * @param amount - the threshold amount (sats) to redeem coupon
   * @param lock - the vault locking bytecode
   * @param reversed - whether to return the string in reversed (default: true)
   */
  static getScriptHash(amount: number, lock: Uint8Array, reversed = true): string {
    return getScriptHash(this.getLockingBytecode(amount, lock), reversed)
  }

  /**
   * Return the address for a Coupon
   *
   *
   * @param amount - the threshold amount (sats) to redeem coupon
   * @param lock - the vault locking bytecode
   * @param network - the network prefix
   */
  static getAddress(amount: number, lock: Uint8Array, network = CashAddressNetworkPrefix.mainnet) {
    let lockingBytecode = this.getLockingBytecode(amount, lock)
    let result = lockingBytecodeToCashAddress({ bytecode: lockingBytecode, prefix: network, tokenSupport: false })
    if (typeof result === 'string') throw (result)
    return result.address
  }

  /**
    * Return the unlockingBytecode for a Coupon
    *
    *
    * @param amount - the threshold amount (sats) to redeem coupon
    * @param lock - the vault locking bytecode
    */
  static getUnlockingBytecode(amount: number, lock: Uint8Array) {
    const amountVm = encodeDataPush(bigIntToVmNumber(BigInt(amount)))
    const lockVm = encodeDataPush(lock)
    const unlockingScript = hexToBin(this.unlockingScript)
    return new Uint8Array(
      [
        ...lockVm,
        ...amountVm,
        ...unlockingScript
      ]
    )
  }

  /**
   * Return the lockingBytecode for a Coupon
   *
   *
   * @param amount - the threshold amount (sats) to redeem coupon
   * @param lock - the Vault locking bytecode
   */
  static getLockingBytecode(amount: number, lock: Uint8Array) {
    return new Uint8Array(
      [
        ...hexToBin("aa20"),
        ...hash256(this.getUnlockingBytecode(amount, lock)),
        ...hexToBin("87")
      ]
    );
  }

  // /**
  //  * Return the unlockingBytecode for a Coupon
  //  *
  //  *
  //  * @param amount - the threshold amount (sats) to redeem coupon
  //  * @param lock - the vault locking bytecode
  //  */
  // static getUnlockingBytecode(amount: number, lock: Uint8Array) {

  //   const bytecodeResult = this.compiler.generateBytecode({
  //     data: {
  //       "bytecode": {
  //         "amount": bigIntToVmNumber(BigInt(amount)),
  //         "lock": lock,
  //       }
  //     },
  //     scriptId: 'coupon_unlock',
  //   })
  //   if (!bytecodeResult.success) {
  //     /* c8 ignore next */
  //     throw new Error('Failed to generate bytecode, script: FutureChan, ' + JSON.stringify(bytecodeResult, null, '  '));
  //   }
  //   return bytecodeResult.bytecode.slice(1)
  // }

  // /**
  //  * Return the lockingBytecode for a Coupon
  //  *
  //  *
  //  * @param amount - the threshold amount (sats) to redeem coupon
  //  * @param lock - the Vault locking bytecode
  //  */
  // static getLockingBytecode(amount: number, lock: Uint8Array) {
  //   const bytecodeResult = this.compiler.generateBytecode({
  //     data: {
  //       "bytecode": {
  //         "amount": bigIntToVmNumber(BigInt(amount)),
  //         "lock": lock,
  //       }
  //     },
  //     scriptId: 'coupon_lock',
  //   })
  //   if (!bytecodeResult.success) {
  //     /* c8 ignore next */
  //     throw new Error('Failed to generate bytecode, script: FutureChan, ' + JSON.stringify(bytecodeResult, null, '  '));
  //   }
  //   return bytecodeResult.bytecode
  // }


}