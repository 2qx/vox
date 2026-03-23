import templateV3 from './template.v3.json' with { type: "json" };
import packageInfo from '../package.json' with { type: "json" };

import {
  binToHex,
  binToUtf8,
  CashAddressNetworkPrefix,
  cashAssemblyToBin,
  cashAddressToLockingBytecode,
  CompilerBch,
  createVirtualMachineBch,
  generateTransaction,
  hexToBin,
  InputTemplate,
  Output,
  OutputTemplate,
  stringify,
  Transaction,
  verifyTransactionTokens
} from '@bitauth/libauth';

import {
  getLibauthCompiler
} from '@unspent/tau';

import {
  BytecodeDataI,
  decodePushBytes,
  getTransactionFees,
  getScriptHash,
  getAddress,
  sumOutputValue,
  sumSourceOutputValue,
  UtxoI
} from '@unspent/tau';

export interface TrustData {
  recipient: string
}

export type TrustJob = {
  record: UtxoI,
  utxo: UtxoI
}

export default class Trust {

  static USER_AGENT = packageInfo.name;

  static PROTOCOL_IDENTIFIER = "U3P";

  static VERSION = "1.0.0";

  static tokenAware = false;

  static template = templateV3;

  static compiler: CompilerBch = getLibauthCompiler(this.template);

  static vm = createVirtualMachineBch();

  static PERIOD = 4383;
  static INSTALLMENT_DENOMINATOR = 100;
  static RETURN_NUMERATOR = 9_899;
  static RETURN_DENOMINATOR = 10_000;

  static dataToBytecode(data: TrustData) {
    return {
      "recipient": hexToBin(data.recipient)
    }
  }



  static parseNFT(utxo: UtxoI): BytecodeDataI {

    if (utxo.token_data?.nft?.commitment) {
      let byteData = decodePushBytes(hexToBin(utxo.token_data?.nft?.commitment))
      if (binToUtf8(byteData[0]!) !== this.PROTOCOL_IDENTIFIER) throw Error("Non-annuity record NFT passed as annuity")
      return {
        "recipient": byteData[1]!
      }
    } else {
      throw Error("Could not parse annuity NFT")
    }
  }

  static encodeCommitment(data: TrustData) {
    let commitment = cashAssemblyToBin(
      `<"${this.PROTOCOL_IDENTIFIER}"><0x${data.recipient}>`)
    if (typeof commitment === "string") throw commitment
    return binToHex(commitment)
  }

  static getLockingBytecode(data: BytecodeDataI): Uint8Array {

    const lockingBytecodeResult = this.compiler.generateBytecode(
      {
        data: {
          "bytecode": data
        },
        scriptId: 'lock'
      }
    )

    if (!lockingBytecodeResult.success) {
      /* c8 ignore next */
      throw new Error('Failed to generate bytecode, script: , ' + stringify(lockingBytecodeResult));
    }
    return lockingBytecodeResult.bytecode
  }

  /**
     * Get getScriptHash
     *
     * @param record - a utxo parameters of the subscription.
     * @param reversed - whether to reverse the hash.
     * @throws {Error} if transaction generation fails.
     * @returns a cashaddress.
     */
  static getScriptHash(
    record: UtxoI,
    reversed = true
  ): string {
    return getScriptHash(
      this.getLockingBytecode(
        this.parseNFT(record)
      ),
      reversed
    )
  }

  static getAddress(data: TrustData, prefix = "bitcoincash"): string {
    let bytecodeData = this.dataToBytecode(data)
    return getAddress(
      this.getLockingBytecode(bytecodeData),
      prefix as CashAddressNetworkPrefix
    )
  }

  static getSourceOutput(data: BytecodeDataI, utxo: UtxoI): Output {

    return {
      lockingBytecode: this.getLockingBytecode(data),
      valueSatoshis: BigInt(utxo.value)
    }

  }

  static getInstallmentOutput(data: BytecodeDataI, utxo: UtxoI): OutputTemplate<CompilerBch> {

    let outputValue = Math.round((utxo.value) / this.INSTALLMENT_DENOMINATOR) 

    return {
      lockingBytecode: data["recipient"]!,
      valueSatoshis: BigInt(outputValue),
    }

  }

  static getReturnOutput(data: BytecodeDataI, utxo: UtxoI): OutputTemplate<CompilerBch> {

    let outputValue = Math.round((utxo.value * this.RETURN_NUMERATOR) / this.RETURN_DENOMINATOR) 

    return {
      lockingBytecode: {
        data: {
          "bytecode": data
        },
        compiler: this.compiler,
        script: 'lock'
      },
      valueSatoshis: BigInt(outputValue),
    }

  }

  static getExecutorOutput(
    cashaddr: string,
    amount: bigint
  ): OutputTemplate<CompilerBch> {

    let lockingBytecode = cashAddressToLockingBytecode(cashaddr)
    if (typeof lockingBytecode == "string") throw lockingBytecode

    return {
      lockingBytecode: lockingBytecode.bytecode,
      valueSatoshis: amount
    }

  }


  static getInput(
    data: BytecodeDataI,
    utxo: UtxoI,
    sequenceNumberOverride = this.PERIOD
  ): InputTemplate<CompilerBch> {
    return {
      outpointIndex: utxo.tx_pos,
      outpointTransactionHash: hexToBin(utxo.tx_hash),
      sequenceNumber: sequenceNumberOverride,
      unlockingBytecode: {
        data: {
          "bytecode": data
        },
        compiler: this.compiler,
        script: 'unlock',
        valueSatoshis: BigInt(utxo.value),
      },
    } as InputTemplate<CompilerBch>
  }

  /**
     * Step annuity installments forward 
     *
     * @param jobs - a list of trust records and utxos.
     * @param height - the current block height.
     * @param executorCashaddress - address to receive excess fees, if any.
     * @param sequenceNumberOverride - override the default period (dev only).
     * @throws {Error} if transaction generation fails.
     * @returns a cashaddress.
     */

  static execute(
    jobs: TrustJob[],
    height: number,
    executorCashaddress?: string,
    fee = 1
  ): {
    transaction: Transaction,
    sourceOutputs: Output[],
    verify: string | boolean
  } {


    const inputs: InputTemplate<CompilerBch>[] = [];
    const outputs: OutputTemplate<CompilerBch>[] = [];
    let sourceOutputs = [];

    const config = {
      locktime: 0,
      version: 2,
      inputs, outputs,
    }

    // add sources, inputs, and installment outputs to the config
    for (let job of jobs) {
      let data = this.parseNFT(job.record)
      // if the job is not in mempool
      if (job.utxo.height > 0) {
        const age = height - job.utxo.height

        // if the subscription is ready to be processed
        if (age >= this.PERIOD) {
          config.inputs.push(this.getInput(data, job.utxo, this.PERIOD));
          config.outputs.push(this.getInstallmentOutput(data, job.utxo));
          sourceOutputs.push(this.getSourceOutput(data, job.utxo));
        }
      }
    }

    // add principal return outputs
    for (let job of jobs) {
      let data = this.parseNFT(job.record)
      // if the job is not in mempool
      if (job.utxo.height > 0) {
        const age = height - job.utxo.height
        // if the subscription is ready to be processed
        if (age >= this.PERIOD) {
          config.outputs.push(this.getReturnOutput(data, job.utxo));
        }
      }
    }

    if (executorCashaddress && config.inputs.length > 0) {
      let sumSatsOut = sumOutputValue(config.outputs)
      let sumSatsIn = sumSourceOutputValue(sourceOutputs)
      let executorBonus = sumSatsIn - sumSatsOut 
      if (executorBonus > 0) {
        config.outputs.push(
          this.getExecutorOutput(
            executorCashaddress,
            executorBonus
          )
        )
      }
    }

    let result = generateTransaction(config);
    if (!result.success) throw new Error('generate transaction failed!, errors: ' + stringify(result.errors));
    let transaction = result.transaction

    if (executorCashaddress && config.inputs.length > 0) {
      const estimatedFee = getTransactionFees(result.transaction, fee) + 1n
      console.log(estimatedFee)
      const lastIdx = config.outputs.length - 1
      config.outputs[lastIdx]!.valueSatoshis = config.outputs[lastIdx]!.valueSatoshis - estimatedFee
    }

    result = generateTransaction(config);
    if (!result.success) throw new Error('generate transaction failed!, errors: ' + JSON.stringify(result.errors, null, '  '));

    transaction = result.transaction
    const tokenValidationResult = verifyTransactionTokens(
      transaction,
      sourceOutputs,
      { maximumTokenCommitmentLength: 40 }
    );
    if (tokenValidationResult !== true) throw tokenValidationResult;

    let verify = this.vm.verify({
      sourceOutputs: sourceOutputs,
      transaction: transaction,
    })

    if (typeof verify == "string") throw verify

    return {
      sourceOutputs: sourceOutputs,
      transaction: transaction,
      verify: verify
    }

  }

}