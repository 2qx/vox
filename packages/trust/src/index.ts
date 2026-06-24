import templateV3 from './template.v3.json' with { type: "json" };
import packageInfo from '../package.json' with { type: "json" };

import {
  binToHex,
  binToUtf8,
  CashAddressNetworkPrefix,
  cashAssemblyToBin,
  cashAddressToLockingBytecode,
  CompilerBch,
  createVirtualMachineBch2026,
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
  getLibauthCompiler,
  getWalletInput,
  getWalletSourceOutput,
  getChangeOutput
} from '@unspent/tau';

import {
  BytecodeDataI,
  decodePushBytes,
  getTransactionFees,
  getScriptHash,
  sumOutputValue,
  sumSourceOutputValue,
  UtxoI,
  UnspentError
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

  static vm = createVirtualMachineBch2026();

  static PERIOD = 4383;
  static INSTALLMENT_DENOMINATOR = 100;
  static RETURN_NUMERATOR = 9_899;
  static RETURN_DENOMINATOR = 10_000;

  static dataToBytecode(data: TrustData) {
    return {
      "recipient": hexToBin(data.recipient)
    }
  }



  static asRecord(lockingBytecode: Uint8Array): UtxoI {
    const commitment = Trust.encodeCommitment(
      {
        "recipient": binToHex(lockingBytecode)
      }
    )
    return {
      height: -1,
      tx_hash: "00000000000000000000000000000000",
      tx_pos: 0,
      value: 0,
      token_data:
      {
        category: "",
        amount: "0",
        nft: {
          commitment: commitment,
          capability: "none"
        }

      }
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

  /**
     * Get cashaddress
     *
     * @throws {Error} Throws no address error.
     * @returns a cashaddress.
     */
  static getAddress(
  ): string {
    throw Error(UnspentError.NoCashAddrForp2s)
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

  static getDeposit(data: BytecodeDataI, amount: number): OutputTemplate<CompilerBch> {

    return {
      lockingBytecode: {
        data: {
          "bytecode": data
        },
        compiler: this.compiler,
        script: 'lock'
      },
      valueSatoshis: BigInt(amount),
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


  static getWalletInputs(
    utxos: UtxoI[],
    amount: bigint,
    privateKey?: string,
    sourceOutputs: Output[] = []
  ): {
    inputs: InputTemplate<CompilerBch>[],
    outputs: OutputTemplate<CompilerBch>[],
    sourceOutputs: Output[]
  } {

    let inputs: InputTemplate<CompilerBch>[] = [];
    let outputs: OutputTemplate<CompilerBch>[] = [];

    // Only use straight sat utxos if placing Bch
    utxos = utxos.filter(u => !u.token_data)

    // TODO: sort by highest value first
    if (utxos.length == 0) throw Error("no wallet utxos left, maximum recursion depth reached.");

    // get a random utxo.
    const randomIdx = Math.floor(Math.random() * utxos.length)
    const randomUtxo = utxos[randomIdx]!

    // remove the random utxo in place
    utxos.splice(randomIdx, 1);

    // spend the utxo
    inputs.push(getWalletInput(randomUtxo, privateKey))
    sourceOutputs.push(getWalletSourceOutput(randomUtxo, privateKey));
    let sumSats = sumSourceOutputValue(sourceOutputs)

    if (
      // or collecting sats and not enough sats inputs 
      (sumSats < amount)
    ) {
      // to it again
      let nextTry = this.getWalletInputs(
        [...utxos],
        amount,
        privateKey,
        [...sourceOutputs]
      )
      inputs.push(...nextTry.inputs)
      outputs.push(...nextTry.outputs)
      sourceOutputs = nextTry.sourceOutputs
    }
    return { inputs, outputs, sourceOutputs }
  }

  static getWalletLayers(
    config: {
      locktime: number;
      version: number;
      inputs: InputTemplate<CompilerBch>[];
      outputs: OutputTemplate<CompilerBch>[];
    },
    sourceOutputs: Output[],
    walletUtxos: UtxoI[],
    privateKey?: string,
  ) {
    // Calculate excess cash and tokens required to fund the exchange
    let sumSatsOut = sumOutputValue(config.outputs)
    let sumSatsIn = sumSourceOutputValue(sourceOutputs)
    let satsRequired = sumSatsOut - sumSatsIn

    const satsIn = this.getWalletInputs(walletUtxos, satsRequired, privateKey)
    config.inputs.push(...satsIn.inputs);
    sourceOutputs.push(...satsIn.sourceOutputs);




    // Calculate excess cash and tokens to be returned as change
    sumSatsOut = sumOutputValue(config.outputs)
    sumSatsIn = sumSourceOutputValue(sourceOutputs)
    let cashChange = sumSatsIn - sumSatsOut
    config.outputs.push(getChangeOutput(cashChange, 0n, undefined, privateKey))

    return config
  }

  static fund(
    amount: number,
    lockingBytecode: Uint8Array | string,
    walletUtxos: UtxoI[],
    privateKey?: string,
    fee = 1
  ): {
    transaction: Transaction,
    sourceOutputs: Output[],
    verify: string | boolean
  } {
    const inputs: InputTemplate<CompilerBch>[] = [];
    const outputs: OutputTemplate<CompilerBch>[] = [];
    let sourceOutputs: Output[] = [];

    if (typeof lockingBytecode !== "string") lockingBytecode = binToHex(lockingBytecode)
    let data = this.dataToBytecode(
      { "recipient": lockingBytecode }
    )

    let config = {
      locktime: 0,
      version: 2,
      inputs, outputs,
    }

    // amount
    config.outputs.push(this.getDeposit(data, amount))
    config = this.getWalletLayers(config, sourceOutputs, walletUtxos, privateKey)

    let result = generateTransaction(config);
    if (!result.success) throw new Error('generate transaction failed!, errors: ' + stringify(result.errors));
    let transaction = result.transaction

    const estimatedFee = getTransactionFees(result.transaction, fee)

    // subtract fees off the change output
    const outIdx = config.outputs.length - 1
    config.outputs[outIdx]!.valueSatoshis = config.outputs[outIdx]!.valueSatoshis - estimatedFee

    result = generateTransaction(config);
    if (!result.success) throw new Error('generate transaction failed!, errors: ' + JSON.stringify(result.errors, null, '  '));

    transaction = result.transaction
    const tokenValidationResult = verifyTransactionTokens(
      transaction,
      sourceOutputs,
      { maximumTokenCommitmentLength: 128 }
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