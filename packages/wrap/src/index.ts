import template from './template.v1.json' with { type: "json" };

import {
    binToHex,
    CompilerBCH,
    createVirtualMachineBCH,
    deriveHdPublicKey,
    generateTransaction,
    hdPrivateKeyToP2pkhLockingBytecode,
    hexToBin,
    InputTemplate,
    OutputTemplate,
    verifyTransactionTokens,
    Output,
    encodeTransactionBCH
} from '@bitauth/libauth';

import {
    getTransactionFees,
    getAddress,
    type CashAddressNetworkPrefix,
    getLibauthCompiler,
    getScriptHash,
    UtxoI,
    sumUtxoValue,
    sumTokenAmounts
} from '@unspent/tau';

const WBCH = hexToBin('ff4d6e4b90aa8158d39c5dc874fd9411af1ac3b5ed6f354755e8362a0d02c6b3')


export default class Wrap {

    static tokenAware = true;

    static template = template;

    static compiler: CompilerBCH = getLibauthCompiler(this.template);

    static vm = createVirtualMachineBCH();

    static getLockingBytecode(data = {}): Uint8Array {
        const lockingBytecodeResult = this.compiler.generateBytecode(
            {
                data: data,
                scriptId: 'lock'
            })
        if (!lockingBytecodeResult.success) throw new Error(
            'Failed to generate bytecode, script: , ' + JSON.stringify(lockingBytecodeResult, null, '  '
            ));
        return lockingBytecodeResult.bytecode
    }

    static getScriptHash(reversed = true): string {
        return getScriptHash(this.getLockingBytecode(), reversed)
    }

    /**
     * Get cashaddress
     *
     * @param prefix - cashaddress prefix.
     * @throws {Error} if transaction generation fails.
     * @returns a cashaddress.
     */

    static getAddress(prefix = "bitcoincash" as CashAddressNetworkPrefix): string {
        return getAddress(this.getLockingBytecode(), prefix, this.tokenAware)
    }

    static getSourceOutput(utxo: UtxoI): Output {

        return {
            lockingBytecode: this.getLockingBytecode(),
            valueSatoshis: BigInt(utxo.value),
            token: {
                category: hexToBin(utxo.token_data!.category!),
                amount: BigInt(utxo.token_data?.amount!)
            }
        }

    }


    static getInput(utxo: UtxoI): InputTemplate<CompilerBCH> {
        return {
            outpointIndex: utxo.tx_pos,
            outpointTransactionHash: hexToBin(utxo.tx_hash),
            sequenceNumber: 0,
            unlockingBytecode: {
                compiler: this.compiler,
                script: 'unlock'
            },
        } as InputTemplate<CompilerBCH>
    }

    static getOutput(utxo: UtxoI, amount: number): OutputTemplate<CompilerBCH> {

        return {
            lockingBytecode: {
                compiler: this.compiler,
                script: 'lock'
            },
            valueSatoshis: BigInt(utxo.value + amount),
            token: {
                category: hexToBin(utxo.token_data!.category!),
                amount: BigInt(utxo.token_data?.amount!) - BigInt(amount)

            }
        }

    }

    static getWalletSourceOutput(utxo: UtxoI, key?: string): Output {

        const lockingBytecode = key ? hdPrivateKeyToP2pkhLockingBytecode({
            addressIndex: 0,
            hdPrivateKey: key
        }) : Uint8Array.from(Array(33))

        return {
            lockingBytecode: lockingBytecode,
            valueSatoshis: BigInt(utxo.value),
            token: utxo.token_data ? {
                category: hexToBin(utxo.token_data!.category!),
                amount: BigInt(utxo.token_data?.amount!)
            } : undefined
        }

    }


    static getWalletInput(utxo: UtxoI, privateKey?: string, addressIndex = 0): InputTemplate<CompilerBCH> {
        const unlockingData = privateKey ? {
            compiler: this.compiler,
            data: {
                hdKeys: {
                    addressIndex: addressIndex,
                    hdPrivateKeys: {
                        'wallet': privateKey
                    },
                }
            },
            script: 'wallet_unlock',
            valueSatoshis: BigInt(utxo.value),
        } : Uint8Array.from(Array())

        return {
            outpointIndex: utxo.tx_pos,
            outpointTransactionHash: hexToBin(utxo.tx_hash),
            sequenceNumber: 0,
            unlockingBytecode: unlockingData,
        } as InputTemplate<CompilerBCH>
    }

    static getChangeOutput(utxos: UtxoI[], amount: number, privateKey?: any, addressIndex = 0, category = WBCH): OutputTemplate<CompilerBCH> {

        const sats = sumUtxoValue(utxos)
        const wsats = sumTokenAmounts(utxos, binToHex(category))

        const lockingBytecode = privateKey ? {
            compiler: this.compiler,
            data: {
                hdKeys: {
                    addressIndex: addressIndex,
                    hdPublicKeys: {
                        'wallet': deriveHdPublicKey(privateKey).hdPublicKey
                    },
                },
            },
            script: 'wallet_lock'
        } : Uint8Array.from(Array(33))

        return {
            lockingBytecode: lockingBytecode,
            valueSatoshis: BigInt(sats - amount),
            token: {
                category: category,
                amount: BigInt(wsats) + BigInt(amount)
            }
        }

    }

    /**
     * Get source outputs, transform contract & wallet outpoints for spending verification.
     *
     * @param contractUtxo - contract outputs to use as input.
     * @param walletUtxos - wallet outputs to use as input.
     * @param privateKey - private key to sign transaction wallet inputs.
     *
     * @returns a transaction template.
     */

    static getSourceOutputs(
        contractUtxo: UtxoI,
        walletUtxos: UtxoI[],
        privateKey?: string
    ): Output[] {
        const sourceOutputs: Output[] = [];
        sourceOutputs.push(this.getSourceOutput(contractUtxo));
        sourceOutputs.push(...walletUtxos.map(u => { return this.getWalletSourceOutput(u, privateKey) }));
        return sourceOutputs
    }

    /**
     * Wrap (+) or Unwrap (-) some amount of WBCH.
     *
     * @param amount     - amount to wrap (satoshis), negative to unwrap.
     * @param contractUtxo - contract outputs to use as input.
     * @param walletUtxos - wallet outputs to use as input.
     * @param privateKey - private key to sign transaction wallet inputs.
     * @param fee - transaction fee to pay (per byte).
     *
     * @throws {Error} if transaction generation fails.
     * @returns a transaction template.
     */

    static swap(
        amount: number,
        contractUtxo: UtxoI,
        walletUtxos: UtxoI[],
        privateKey?: string,
        category?: string,
        fee = 1
    ): string {

        const inputs: InputTemplate<CompilerBCH>[] = [];
        const outputs: OutputTemplate<CompilerBCH>[] = [];

        let wbchCat = category ? hexToBin(category) : WBCH

        let config = {
            locktime: 0,
            version: 2,
            inputs,
            outputs
        }

        config.inputs.push(this.getInput(contractUtxo));
        config.inputs.push(...walletUtxos.map(u => { return this.getWalletInput(u, privateKey) }));

        config.outputs.push(this.getOutput(contractUtxo, amount));
        config.outputs.push(this.getChangeOutput(walletUtxos, amount, privateKey, 0, wbchCat));

        let result = generateTransaction(config);
        if (!result.success) throw new Error('generate transaction failed!, errors: ' + JSON.stringify(result.errors, null, '  '));

        const estimatedFee = getTransactionFees(result.transaction, fee)
        config.outputs[1]!.valueSatoshis = config.outputs[1]!.valueSatoshis - estimatedFee

        result = generateTransaction(config);
        if (!result.success) throw new Error('generate transaction failed!, errors: ' + JSON.stringify(result.errors, null, '  '));

        const transaction = result.transaction

        const sourceOutputs = this.getSourceOutputs(contractUtxo, walletUtxos, privateKey)
        const tokenValidationResult = verifyTransactionTokens(
            transaction,
            sourceOutputs
        );

        if (tokenValidationResult !== true && fee > 0) throw tokenValidationResult;

        let verify = this.vm.verify({
            sourceOutputs: sourceOutputs,
            transaction: transaction,
        })

        if (typeof verify == "string") throw verify
        return binToHex(encodeTransactionBCH(transaction))
    }

}