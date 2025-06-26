import templateV3 from './drip-mine.v3.template.json' with { type: "json" };

import {
  hexToBin,
  CompilerBCH,
  generateTransaction,
  InputTemplate,
  CashAddressNetworkPrefix,
  OutputTemplate,
  Transaction,
} from '@bitauth/libauth';

import {
  getLibauthCompiler
} from '@unspent/tau';

import {
  UtxoI,
  getScriptHash,
  getAddress
} from '@unspent/tau';

const DUST_LIMIT = 576;
const MIN_PAYOUT = 164;
const DECAY_NUMERATOR = 4392;
const DECAY_DENOMINATOR = 1333036486;


export default class Drip {

  static template = templateV3

  static compiler: CompilerBCH = getLibauthCompiler(this.template)

  static getLockingBytecode(data = {}): Uint8Array {
    const lockingBytecodeResult = this.compiler.generateBytecode({
      data: data,
      scriptId: 'lock'
    })

    if (!lockingBytecodeResult.success) {
      /* c8 ignore next */
      throw new Error('Failed to generate bytecode, script: , ' + JSON.stringify(lockingBytecodeResult, null, '  '));
    }
    return lockingBytecodeResult.bytecode
  }

  static getScriptHash(reversed = true): string {
    return getScriptHash(this.getLockingBytecode(), reversed)
  }

  static getAddress(prefix = "bitcoincash" as CashAddressNetworkPrefix): string {
    return getAddress(this.getLockingBytecode(), prefix)
  }

  static getOutput(utxo: UtxoI): OutputTemplate<CompilerBCH> {

    let fee = (utxo.value * DECAY_NUMERATOR) / DECAY_DENOMINATOR
    fee = fee < MIN_PAYOUT ? MIN_PAYOUT : fee
    let outputValue = utxo.value - fee

    if (utxo.value > BigInt(DUST_LIMIT + MIN_PAYOUT)) {
      return {
        lockingBytecode: {
          compiler: this.compiler,
          script: 'lock'
        },
        valueSatoshis: BigInt(outputValue),
      }
    } else {
      return {
        lockingBytecode: hexToBin("6a"),
        valueSatoshis: BigInt(0),
      }
    }
  }

  static getInput(utxo: UtxoI): InputTemplate<CompilerBCH> {
    let unlockingScript = utxo.value > BigInt(DUST_LIMIT + MIN_PAYOUT) ? 'unlock_return' : 'unlock_burn'
    return {
      outpointIndex: utxo.tx_pos,
      outpointTransactionHash: hexToBin(utxo.tx_hash),
      sequenceNumber: 1,
      unlockingBytecode: {
        compiler: this.compiler,
        script: unlockingScript,
        valueSatoshis: BigInt(utxo.value),
      },
    } as InputTemplate<CompilerBCH>
  }

  static processOutpoint(utxo: UtxoI): Transaction {

    const inputs: InputTemplate<CompilerBCH>[] = [];
    const outputs: OutputTemplate<CompilerBCH>[] = [];

    outputs.push(this.getOutput(utxo));
    inputs.push(this.getInput(utxo));

    const result = generateTransaction({
      locktime: 0,
      version: 2,
      inputs, outputs,
    });
    if (!result.success) {
      /* c8 ignore next */
      throw new Error('generate transaction failed!, errors: ' + JSON.stringify(result.errors, null, '  '));
    }
    return result.transaction
  }

}