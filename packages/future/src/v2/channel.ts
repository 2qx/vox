import {
    bigIntToVmNumber,
    binToHex,
    CompilerBCH,
    deriveHdPublicKey,
    encodeTransaction,
    generateTransaction,
    hexToBin,
    InputTemplate,
    lockingBytecodeToCashAddress,
    OutputTemplate,
    Output,
    verifyTransactionTokens
} from "@bitauth/libauth"

import type {
    UtxoI
} from '@unspent/tau';

import Future from "./auth.js"

import { toBin } from './util.js';

export class Channel {

    static compiler = Future.compiler;

    static getLockingBytecode(channel?: string): Uint8Array {
        const lockingBytecodeResult = this.compiler.generateBytecode({
            data: {
                "bytecode": {
                    "channel": toBin(channel),
                    "vault_script": hexToBin("c0d3c0d0a06376b17568c0cec0d188c0cdc0c788c0d0c0c693c0d3c0cc939c77"),
                    "coupon_script": hexToBin("00cc00c694a16900c788c08bc39c")
                }
            },
            scriptId: 'channel_lock',
        })

        if (!lockingBytecodeResult.success) {
            /* c8 ignore next */
            throw new Error('Failed to generate bytecode, script: , ' + JSON.stringify(lockingBytecodeResult, null, '  '));
        }
        return lockingBytecodeResult.bytecode
    }

    static getAddress(channel?: string): string {
        const bytecode = this.getLockingBytecode(channel)
        const result = lockingBytecodeToCashAddress({ bytecode: bytecode, tokenSupport: true })
        if (typeof result === 'string') throw (result)
        return result.address
    }


    static getInputs(channel: string, utxos: UtxoI[]): InputTemplate<CompilerBCH>[] {
        return utxos.map(u => this.getInput(channel, u))
    }

    static getInput(channel: string, utxo: UtxoI): InputTemplate<CompilerBCH> {
        return {
            outpointIndex: utxo.tx_pos,
            outpointTransactionHash: hexToBin(utxo.tx_hash),
            // 
            sequenceNumber: 1,
            unlockingBytecode: {
                compiler: this.compiler,
                script: 'process_message',
                data: {
                    "bytecode": {
                        "channel": toBin(channel),
                        "locktime": bigIntToVmNumber(BigInt((Number(utxo.value) / 10) * 1000)),

                        "vault_script": hexToBin("c0d3c0d0a06376b17568c0cec0d188c0cdc0c788c0d0c0c693c0d3c0cc939c77"),
                        "coupon_script": hexToBin("00cc00c694a16900c788c08bc39c")
                    }
                },
                valueSatoshis: BigInt(utxo.value),
            },
        } as InputTemplate<CompilerBCH>
    }

    static getSourceOutputs(channel: string, utxos: UtxoI[]): Output[] {
        return utxos.map(u => this.getSourceOutput(channel, u))
    }

    static getSourceOutput(channel: string, utxo: UtxoI): Output {

        return {
            outpointIndex: utxo.tx_pos,
            outpointTransactionHash: hexToBin(utxo.tx_hash),
            // 
            sequenceNumber: 1,
            unlockingBytecode: Uint8Array.from([]),
            lockingBytecode: this.getLockingBytecode(channel),
            valueSatoshis: BigInt(utxo.value),
        } as Output
    }


    static getOutput(utxo: UtxoI, isPremature: boolean): OutputTemplate<CompilerBCH> {

        let futureTime = utxo.value / 10 * 1000
        let outputValue = isPremature ? utxo.value * 10 : utxo.value
        let couponThreshold = isPremature ? 100000000 : 10000000

        let lockingBytecode = this.getCouponLockingBytecode(futureTime, couponThreshold)

        return {
            lockingBytecode: lockingBytecode,
            valueSatoshis: BigInt(outputValue),
        }
    }

    static getOutputs(utxos: UtxoI[], isPremature: boolean): OutputTemplate<CompilerBCH>[] {
        return utxos.map(u => this.getOutput(u, isPremature))
    }

    static getCouponLockingBytecode(time: number, threshold: number) {
        const lockingBytecodeResult = this.compiler.generateBytecode({
            data: {
                "bytecode": {
                    "vault_locktime": bigIntToVmNumber(BigInt(time)),
                    "amount": bigIntToVmNumber(BigInt(threshold))
                }
            },
            scriptId: 'channel_lock',
        })
        if (!lockingBytecodeResult.success) {
            /* c8 ignore next */
            throw new Error('Failed to generate bytecode, script: FutureChan, ' + JSON.stringify(lockingBytecodeResult, null, '  '));
        }
        return lockingBytecodeResult.bytecode
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

    static getChangeOutput(utxo: UtxoI, privateKey?: any, addressIndex = 0): OutputTemplate<CompilerBCH> {

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
            valueSatoshis: BigInt(utxo.value)
        }

    }


    static clear(channel: string, utxos: UtxoI[]): string {

        const inputs: InputTemplate<CompilerBCH>[] = [];
        const outputs: OutputTemplate<CompilerBCH>[] = [];

        inputs.push(... this.getInputs(channel, utxos));
        outputs.push(... this.getOutputs(utxos, false));

        const result = generateTransaction({
            locktime: 0,
            version: 2,
            inputs,
            outputs,
        });

        if (!result.success) throw new Error('generate transaction failed!, errors: ' + JSON.stringify(result.errors, null, '  '));

        const tokenValidationResult = verifyTransactionTokens(
            result.transaction,
            this.getSourceOutputs(channel, utxos)
        );
        if (tokenValidationResult !== true) throw tokenValidationResult;

        return binToHex(encodeTransaction(result.transaction))

    }

    // static edit(channel: string, utxos: UtxoI[], auth: UtxoI, privateKey?: string): string {

    // }
    // static burn(): string {
    //     privateKey
    // }




}
