import templateV3 from './drip-mine.v3.template.json' with { type: "json" };

import {
  hexToBin,
  CompilerBCH,
  generateTransaction,
  InputTemplate,
  OutputTemplate,
  Transaction,
} from '@bitauth/libauth';

import {
  getLibauthCompiler
} from '@unspent/tau';

import type {
  AddressListUnspentEntry,
} from '@unspent/tau';

const DUST_LIMIT = 576;
const MIN_PAYOUT = 164;
const DECAY_NUMERATOR = 4392;
const DECAY_DENOMINATOR = 1333036486;



export default class DripV3 {

  static template = templateV3

  static compiler = getLibauthCompiler(this.template)

  static getOutput(utxo: AddressListUnspentEntry): OutputTemplate<CompilerBCH> {

    let fee = (utxo.value * DECAY_NUMERATOR) / DECAY_DENOMINATOR
    fee = fee < MIN_PAYOUT ? MIN_PAYOUT : fee
    let outputValue = utxo.value - fee

    if (outputValue >= BigInt(DUST_LIMIT + MIN_PAYOUT)) {
      return {
        lockingBytecode: {
          compiler: this.compiler,
          script: 'drip_mine_covenant'
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

  static getInput(utxo: AddressListUnspentEntry): InputTemplate<CompilerBCH> {
    return {
      outpointIndex: utxo.tx_pos,
      outpointTransactionHash: hexToBin(utxo.tx_hash),
      sequenceNumber: 1,
      unlockingBytecode: {
        compiler: this.compiler,
        script: 'unlock_return',
        valueSatoshis: BigInt(utxo.value),
      },
    } as InputTemplate<CompilerBCH>
  }

  static processOutpoint(utxo: AddressListUnspentEntry, locktime?: number): Transaction {

    const inputs: InputTemplate<CompilerBCH>[] = [];
    const outputs: OutputTemplate<CompilerBCH>[] = [];

    outputs.push(this.getOutput(utxo));
    inputs.push(this.getInput(utxo));

    const result = generateTransaction({
      locktime: locktime ? locktime : utxo.height + 1,
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