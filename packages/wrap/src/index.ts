import template from './template.v1.json' with { type: "json" };
import packageInfo from '../package.json' with { type: "json" };

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
    Transaction,
    encodeTransactionBCH,
    stringify
} from '@bitauth/libauth';

import {
    getTransactionFees,
    getAddress,
    type CashAddressNetworkPrefix,
    getLibauthCompiler,
    getScriptHash,
    UtxoI,
    sumSourceOutputValue,
    sumSourceOutputTokenAmounts
} from '@unspent/tau';

export const WBCH = hexToBin('ff4d6e4b90aa8158d39c5dc874fd9411af1ac3b5ed6f354755e8362a0d02c6b3')
export const tWBCH = hexToBin('bb61cd7a6c8a3a3742d965dc7ac73c1117382a5c8930b68338deb881f75c0214')


export default class Wrap {

    static USER_AGENT = packageInfo.name;

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

    static getOutput(utxo: UtxoI, amount: bigint): OutputTemplate<CompilerBCH> {

        return {
            lockingBytecode: {
                compiler: this.compiler,
                script: 'lock'
            },
            valueSatoshis: BigInt(utxo.value) + amount,
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

        let unlockingData = privateKey ? {
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

        if (utxo.token_data) {
            // @ts-ignore
            unlockingData.token = {
                amount: BigInt(utxo.token_data.amount),
                category: hexToBin(utxo.token_data.category)
            }
        }
        return {
            outpointIndex: utxo.tx_pos,
            outpointTransactionHash: hexToBin(utxo.tx_hash),
            sequenceNumber: 0,
            unlockingBytecode: unlockingData,
        } as InputTemplate<CompilerBCH>
    }

    static getWrappedOutput(
        amount: bigint,
        privateKey?: any,
        addressIndex = 0,
        category = WBCH
    ): OutputTemplate<CompilerBCH> {

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
            valueSatoshis: 800n,
            token: {
                category: category,
                amount: amount
            }
        }
    }

    static getChangeOutput(
        amount: bigint,
        privateKey?: any,
        addressIndex = 0
    ): OutputTemplate<CompilerBCH> {

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
            valueSatoshis: amount
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

    static getVaultLayers(
        utxos: UtxoI[],
        amount: number,
        category?: any,
        sourceOutputs: Output[] = []
    ): {
        inputs: InputTemplate<CompilerBCH>[],
        outputs: OutputTemplate<CompilerBCH>[],
        sourceOutputs: Output[]
    } {

        let inputs: InputTemplate<CompilerBCH>[] = [];
        let outputs: OutputTemplate<CompilerBCH>[] = [];

        utxos = utxos.filter(u => u.token_data?.category == binToHex(category))
        if (amount < 0) utxos = utxos.filter(u => u.value > 800)
        if (utxos.length == 0) throw Error("no vault utxos left, maximum recursion depth reached.");

        const randomIdx = Math.floor(Math.random() * utxos.length)
        const randomUtxo = utxos[randomIdx]!

        // remove the random utxo in place
        utxos.splice(randomIdx, 1);

        // Try to satisfy the swap with another utxos
        inputs.push(this.getInput(randomUtxo))
        sourceOutputs.push(this.getSourceOutput(randomUtxo));

        if (
            // Redeeming WBCH for BCH and this thread can satisfy the swap
            (amount < 0 && -(randomUtxo?.value) < amount) ||
            (amount > 0 && (BigInt(randomUtxo?.token_data?.amount!) > amount))
        ) {
            outputs.push(this.getOutput(randomUtxo, BigInt(amount)))
        } else {
            if (amount < 0 && amount < -(randomUtxo?.value! - 800)) {
                // liquidate sats on this utxo 
                outputs.push(this.getOutput(randomUtxo, -BigInt(randomUtxo?.value! - 800)))
                amount += randomUtxo?.value! - 800
            }
            // and try again
            let nextTry = this.getVaultLayers([...utxos], amount, category, [...sourceOutputs])
            inputs.push(...nextTry.inputs)
            outputs.push(...nextTry.outputs)
            sourceOutputs = nextTry.sourceOutputs
        }
        return { inputs, outputs, sourceOutputs }
    }


    static getWalletLayers(
        utxos: UtxoI[],
        amount: bigint,
        privateKey?: string,
        category?: any,
        sourceOutputs: Output[] = []
    ): {
        inputs: InputTemplate<CompilerBCH>[],
        outputs: OutputTemplate<CompilerBCH>[],
        sourceOutputs: Output[]
    } {

        let inputs: InputTemplate<CompilerBCH>[] = [];
        let outputs: OutputTemplate<CompilerBCH>[] = [];

        // Only use straight sat utxos if placing BCH
        if (amount > 0) utxos = utxos.filter(u => !u.token_data)
        if (amount < 0) utxos = utxos.filter(u => u.token_data?.category == binToHex(category))
        if (utxos.length == 0) throw Error("no wallet utxos left, maximum recursion depth reached.");


        // get a random utxo.
        const randomIdx = Math.floor(Math.random() * utxos.length)
        const randomUtxo = utxos[randomIdx]!

        // remove the random utxo in place
        utxos.splice(randomIdx, 1);

        // spend the utxo
        inputs.push(this.getWalletInput(randomUtxo, privateKey))
        sourceOutputs.push(this.getWalletSourceOutput(randomUtxo, privateKey));
        let sumSats = sumSourceOutputValue(sourceOutputs)
        let sumWSats = sumSourceOutputTokenAmounts(sourceOutputs, binToHex(category))
        if (
            // Redeeming WBCH for BCH, and token amount is sufficient
            (amount < 0 && sumWSats >= -amount) ||
            // Or if placing BCH for WBCH, and utxo value is sufficient
            (amount > 0 && sumSats > amount)
        ) {
            // This utxo finally satisfied the swap 
            // There is WBCH placed
            if (amount > 0) {
                outputs.push(this.getWrappedOutput(amount, privateKey, 0, category))
            }
            if (amount < 0) {
                outputs.push(this.getWrappedOutput(
                    sumWSats + amount,
                    privateKey,
                    0,
                    category
                ))
            }

            let satsOut = (sumSats) - (amount + 800n)
            outputs.push(this.getChangeOutput(satsOut, privateKey))
        }
        // Liquidate this utxo and try again
        else {
            let nextTry = this.getWalletLayers(
                [...utxos],
                amount,
                privateKey,
                category,
                [...sourceOutputs]
            )
            inputs.push(...nextTry.inputs)
            outputs.push(...nextTry.outputs)
            sourceOutputs = nextTry.sourceOutputs
        }
        return { inputs, outputs, sourceOutputs }
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
        contractUtxos: UtxoI[],
        walletUtxos: UtxoI[],
        privateKey?: string,
        category?: string,
        fee = 1
    ): {
        transaction: Transaction,
        sourceOutputs: Output[],
        verify: string | boolean
    } {

        const inputs: InputTemplate<CompilerBCH>[] = [];
        const outputs: OutputTemplate<CompilerBCH>[] = [];

        let wbchCat = category ? hexToBin(category) : WBCH

        let config = {
            locktime: 0,
            version: 2,
            inputs,
            outputs
        }

        // if placing BCH for WBCH, don't use utxos with tokens
        walletUtxos = walletUtxos.filter(u => u.token_data?.category == category || !u.token_data)


        let vaultLayers = this.getVaultLayers([...contractUtxos], amount, wbchCat);
        config.inputs.push(...vaultLayers.inputs);
        config.outputs.push(...vaultLayers.outputs);
        let sourceOutputs = vaultLayers.sourceOutputs;

        let walletLayers = this.getWalletLayers([...walletUtxos], BigInt(amount), privateKey, wbchCat)
        config.inputs.push(...walletLayers.inputs);
        config.outputs.push(...walletLayers.outputs);
        sourceOutputs.push(...walletLayers.sourceOutputs);

        let result = generateTransaction(config);
        if (!result.success) throw new Error('generate transaction failed!, errors: ' + JSON.stringify(result.errors, null, '  '));

        const estimatedFee = getTransactionFees(result.transaction, fee)

        const lastIdx = config.outputs.length - 1
        config.outputs[lastIdx]!.valueSatoshis = config.outputs[lastIdx]!.valueSatoshis - estimatedFee

        result = generateTransaction(config);
        if (!result.success) throw new Error('generate transaction failed!, errors: ' + JSON.stringify(result.errors, null, '  '));

        const transaction = result.transaction

        const tokenValidationResult = verifyTransactionTokens(
            transaction,
            sourceOutputs
        );
        if (tokenValidationResult !== true && fee > 0) throw tokenValidationResult;

        let verify = this.vm.verify({
            sourceOutputs: sourceOutputs,
            transaction: transaction,
        })

        let feeEstimate = sumSourceOutputValue(sourceOutputs) - sumSourceOutputValue(transaction.outputs)
        if (feeEstimate > 5000) verify = `Excessive fees ${feeEstimate}`
        if (sumSourceOutputTokenAmounts(sourceOutputs, category) == 0n) verify = `Error checking token input`
        let tokenDiff = sumSourceOutputTokenAmounts(sourceOutputs, category) -
            sumSourceOutputTokenAmounts(
                transaction.outputs,
                category
            )
        if (tokenDiff !== 0n) verify = `Swapping should not create destroy tokens, token difference: ${tokenDiff}`
        return {
            sourceOutputs: sourceOutputs,
            transaction: transaction,
            verify: verify
        }
    }

}