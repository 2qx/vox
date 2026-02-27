import templateV3 from './template.v3.json' with { type: "json" };
import packageInfo from '../package.json' with { type: "json" };

import {
  hexToBin,
  CompilerBch,
  generateTransaction,
  InputTemplate,
  CashAddressNetworkPrefix,
  createVirtualMachineBch,
  Output,
  OutputTemplate,
  stringify,
  Transaction
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

  static PROTOCOL_IDENTIFIER = "U3P";

  static VERSION = "1.0.0";

  static tokenAware = true;

  static template = templateV3;

  static compiler: CompilerBch = getLibauthCompiler(this.template);

  static vm = createVirtualMachineBch();

  static getLockingBytecode(receiptBytecode: Uint8Array | string): Uint8Array {

    if (typeof receiptBytecode == "string") receiptBytecode = hexToBin(receiptBytecode)

    const lockingBytecodeResult = this.compiler.generateBytecode({
      data: {
        "bytecode": {
          "recipient": receiptBytecode
        }
      },
      scriptId: 'lock'
    })

    if (!lockingBytecodeResult.success) {
      /* c8 ignore next */
      throw new Error('Failed to generate bytecode, script: , ' + stringify(lockingBytecodeResult));
    }
    return lockingBytecodeResult.bytecode
  }

  static getScriptHash(receiptBytecode: Uint8Array | string, reversed = true): string {
    return getScriptHash(this.getLockingBytecode(receiptBytecode), reversed)
  }

  static getAddress(receiptBytecode: Uint8Array | string, prefix = "bitcoincash"): string {
    return getAddress(this.getLockingBytecode(receiptBytecode), prefix as CashAddressNetworkPrefix)
  }

  static getSourceOutput(receipt: string | Uint8Array, utxo: UtxoI): Output {

    return {
      lockingBytecode: this.getLockingBytecode(receipt),
      valueSatoshis: BigInt(utxo.value)
    }

  }

  static getSourceOutputs(receipts: string[] | Uint8Array[], utxos: UtxoI[]): Output[] {
    return utxos.map((u: UtxoI, i) => {
      return this.getSourceOutput(receipts[i]!, u)
    })
  }


  static getOutput(receiptBytecode: string | Uint8Array, utxo: UtxoI): OutputTemplate<CompilerBch> {

    if (typeof receiptBytecode == "string") receiptBytecode = hexToBin(receiptBytecode)

    let outputValue = Math.round((utxo.value * RETURN_NUMERATOR) / RETURN_DENOMINATOR) - 1

    return {
      lockingBytecode: {
        data: {
          "bytecode": {
            "receipt": receiptBytecode
          }
        },
        compiler: this.compiler,
        script: 'lock'
      },
      valueSatoshis: BigInt(outputValue),
    }

  }

  static getOutputs(receiptBytecodes: string[] | Uint8Array[], utxos: UtxoI[]): OutputTemplate<CompilerBch>[] {
    return utxos.map((u: UtxoI, i) => {
      return this.getOutput(receiptBytecodes[i]!, u)
    })
  }


  static getInput(utxo: UtxoI): InputTemplate<CompilerBch> {
    return {
      outpointIndex: utxo.tx_pos,
      outpointTransactionHash: hexToBin(utxo.tx_hash),
      sequenceNumber: PERIOD,
      unlockingBytecode: {
        compiler: this.compiler,
        script: 'unlock',
        valueSatoshis: BigInt(utxo.value),
      },
    } as InputTemplate<CompilerBch>
  }

  static getInputs(utxos: UtxoI[]): InputTemplate<CompilerBch>[] {
    return utxos.map((u: UtxoI) => {
      return this.getInput(u)
    })
  }

  static processOutpoints(
    receipts: string[] | Uint8Array[],
    utxos: UtxoI[]
  ): {
    transaction: Transaction,
    sourceOutputs: Output[],
    verify: string | boolean
  } {


    const inputs: InputTemplate<CompilerBch>[] = [];
    const outputs: OutputTemplate<CompilerBch>[] = [];

    const config = {
      locktime: 0,
      version: 2,
      inputs, outputs,
    }

    const sourceOutputs = [... this.getSourceOutputs(receipts, utxos)];

    inputs.push(... this.getInputs(utxos));
    outputs.push(... this.getOutputs(receipts, utxos));

    const result = generateTransaction(config);
    if (!result.success) throw new Error('generate transaction failed!, errors: ' + stringify(result.errors));
    const transaction = result.transaction

    let verify = this.vm.verify({
      sourceOutputs: sourceOutputs,
      transaction: transaction,
    })
    
    if (typeof verify == "string") throw Error(verify)

    return {
      sourceOutputs: sourceOutputs,
      transaction: transaction,
      verify: verify
    }


  }

}