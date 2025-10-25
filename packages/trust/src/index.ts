import templateV3 from './template.v3.json' with { type: "json" };
import packageInfo from '../package.json' with { type: "json" };

import {
  binToHex,
  hexToBin,
  CompilerBCH,
  generateTransaction,
  encodeTransaction,
  InputTemplate,
  CashAddressNetworkPrefix,
  OutputTemplate,
  stringify,
} from '@bitauth/libauth';

import {
  getLibauthCompiler
} from '@unspent/tau';

import {
  UtxoI,
  getScriptHash,
  getAddress
} from '@unspent/tau';

const PERIOD = 4383;
const RETURN_NUMERATOR = 989995;
const RETURN_DENOMINATOR = 1000000;


export default class Trust {

  static USER_AGENT = packageInfo.name;
  
  static template = templateV3

  static compiler: CompilerBCH = getLibauthCompiler(this.template)

  static getLockingBytecode(data = {}): Uint8Array {
    const lockingBytecodeResult = this.compiler.generateBytecode({
      data: data,
      scriptId: 'lock'
    })

    if (!lockingBytecodeResult.success) {
      /* c8 ignore next */
      throw new Error('Failed to generate bytecode, script: , ' + stringify(lockingBytecodeResult));
    }
    return lockingBytecodeResult.bytecode
  }

  static getScriptHash(reversed = true): string {
    return getScriptHash(this.getLockingBytecode(), reversed)
  }

  static getAddress(prefix = "bitcoincash"): string {
    return getAddress(this.getLockingBytecode(), prefix as CashAddressNetworkPrefix)
  }

  static getOutput(utxo: UtxoI): OutputTemplate<CompilerBCH> {

    let outputValue = Math.round((utxo.value * RETURN_NUMERATOR) / RETURN_DENOMINATOR) - 1

    return {
        lockingBytecode: {
          compiler: this.compiler,
          script: 'lock'
        },
        valueSatoshis: BigInt(outputValue),
      }
    
  }

  static getInput(utxo: UtxoI): InputTemplate<CompilerBCH> {
    return {
      outpointIndex: utxo.tx_pos,
      outpointTransactionHash: hexToBin(utxo.tx_hash),
      sequenceNumber: PERIOD,
      unlockingBytecode: {
        compiler: this.compiler,
        script: 'unlock',
        valueSatoshis: BigInt(utxo.value),
      },
    } as InputTemplate<CompilerBCH>
  }

  static processOutpoint(utxo: UtxoI): string {

    const inputs: InputTemplate<CompilerBCH>[] = [];
    const outputs: OutputTemplate<CompilerBCH>[] = [];

    outputs.push(this.getOutput(utxo));
    inputs.push(this.getInput(utxo));

    const config = {
      locktime: 0,
      version: 2,
      inputs, outputs,
    }
    const result = generateTransaction(config);
    if (!result.success) throw new Error('generate transaction failed!, errors: '+ stringify(result.errors));
    
    return binToHex(encodeTransaction(result.transaction))
  }

}