import {
    bigIntToVmNumber,
    CompilerBCH,
    generateTransaction,
    hexToBin,
    InputTemplate,
    lockingBytecodeToCashAddress,
    OutputTemplate,
    Output,
    Transaction,
    verifyTransactionTokens
} from "@bitauth/libauth"

import type {
    AddressListUnspentEntry
} from '@unspent/tau';

import Future from "./auth.js"

import { toBin } from './util.js';

export class Channel {

    static compiler = Future.compiler();

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

    static getInputs(channel: string, utxos: AddressListUnspentEntry[]): InputTemplate<CompilerBCH>[] {
        return utxos.map(u => this.getInput(channel, u))
    }

    static getInput(channel: string, utxo: AddressListUnspentEntry): InputTemplate<CompilerBCH> {
        return {
            outpointIndex: utxo.tx_pos,
            outpointTransactionHash: hexToBin(utxo.tx_hash),
            // 
            sequenceNumber: 1,
            unlockingBytecode: {
                compiler: this.compiler,
                script: 'clear_message',
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

    static getSourceOutputs(channel: string, utxos: AddressListUnspentEntry[]): Output[] {
        return utxos.map(u => this.getSourceOutput(channel, u))
    }

    static getSourceOutput(channel: string, utxo: AddressListUnspentEntry): Output {

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


    static getOutput(utxo: AddressListUnspentEntry, isPremature: boolean): OutputTemplate<CompilerBCH> {

        let futureTime = utxo.value / 10 * 1000
        let outputValue = isPremature ? utxo.value * 10 : utxo.value
        let couponThreshold = isPremature ? 100000000 : 10000000

        let lockingBytecode = this.getCouponLockingBytecode(futureTime, couponThreshold)

        return {
            lockingBytecode: lockingBytecode,
            valueSatoshis: BigInt(outputValue),
        }
    }

    static getOutputs(utxos: AddressListUnspentEntry[], isPremature: boolean): OutputTemplate<CompilerBCH>[] {
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

    static processOutpoints(channel: string, utxos: AddressListUnspentEntry[], locktime: number): Transaction {

        const inputs: InputTemplate<CompilerBCH>[] = [];
        const sourceOutputs: Output[] = [];
        const outputs: OutputTemplate<CompilerBCH>[] = [];


        inputs.push(... this.getInputs(channel, utxos));
        sourceOutputs.push(... this.getSourceOutputs(channel, utxos));
        outputs.push(... this.getOutputs(utxos, false));

        const result = generateTransaction({
            locktime: locktime,
            version: 2,
            inputs,
            outputs,
        });

        if (!result.success) {
            /* c8 ignore next */
            throw new Error('generate transaction failed!, errors: ' + JSON.stringify(result.errors, null, '  '));
        }
        const tokenValidationResult = verifyTransactionTokens(
            result.transaction,
            sourceOutputs
        );
        if (tokenValidationResult !== true) {
            throw tokenValidationResult;
        }

        return result.transaction

    }

    static censorMessage() { }

    static clearMessage() { }

    // TODO 
    // The last input must carry the author's NFT
    // static editPost() { }

}
