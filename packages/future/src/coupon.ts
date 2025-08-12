import {
  bigIntToVmNumber,
  CashAddressNetworkPrefix,
  lockingBytecodeToCashAddress,
} from "@bitauth/libauth";
import Future from './auth.js'

export class Coupon {

  static compiler = Future.compiler;

  amount: number = 1000000;
  lock: Uint8Array = new Uint8Array(0);

  static unlockingScript = "00cc00c694a16900c788c08bc39c"

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

    const bytecodeResult = this.compiler.generateBytecode({
      data: {
        "bytecode": {
          "amount": bigIntToVmNumber(BigInt(amount)),
          "lock": lock,
        }
      },
      scriptId: 'coupon_unlock',
    })
    if (!bytecodeResult.success) {
      /* c8 ignore next */
      throw new Error('Failed to generate bytecode, script: FutureChan, ' + JSON.stringify(bytecodeResult, null, '  '));
    }
    return bytecodeResult.bytecode.slice(1)
  }

  /**
   * Return the lockingBytecode for a Coupon
   *
   *
   * @param amount - the threshold amount (sats) to redeem coupon
   * @param lock - the Vault locking bytecode
   */
  static getLockingBytecode(amount: number, lock: Uint8Array) {
    const bytecodeResult = this.compiler.generateBytecode({
      data: {
        "bytecode": {
          "amount": bigIntToVmNumber(BigInt(amount)),
          "lock": lock,
        }
      },
      scriptId: 'coupon_lock',
    })
    if (!bytecodeResult.success) {
      /* c8 ignore next */
      throw new Error('Failed to generate bytecode, script: FutureChan, ' + JSON.stringify(bytecodeResult, null, '  '));
    }
    return bytecodeResult.bytecode
  }


}