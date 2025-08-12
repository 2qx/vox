import template from './template.v2.json' with { type: "json" };
import packageInfo from '../package.json' with { type: "json" };

import {
    bigIntToVmNumber,
    binToHex,
    binToUtf8,
    CompilerBCH,
    createVirtualMachineBCH,
    deriveHdPublicKey,
    disassembleBytecodeBCH,
    encodeTransaction,
    generateTransaction,
    hdPrivateKeyToP2pkhLockingBytecode,
    hexToBin,
    InputTemplate,
    OutputTemplate,
    Output,
    swapEndianness,
    verifyTransactionTokens,
    hash256,
    decodeTransactionBCH,
    OpcodesBCH,
    utf8ToBin,
    encodeDataPush
} from "@bitauth/libauth"

import {
    getTransactionFees,
    getAddress,
    type CashAddressNetworkPrefix,
    getLibauthCompiler,
    getScriptHash,
    sumSourceOutputValue,
    type UtxoI,
    type TransactionHex,
    type AddressGetHistoryEntry
} from '@unspent/tau';

import { toBin } from './util.js';


export class Post {

    hash: string;
    auth?: string;
    height?: number;
    sequence?: number;
    body?: string;
    likes?: number;
    dislikes?: number;
    ref?: string;
    error?: string;



    constructor({ hash = "",
        auth = "",
        height = -1,
        sequence = -1,
        body = "",
        likes = 0,
        dislikes = 0,
        ref = "",
        error = "" }
    ) {
        this.hash = hash;
        this.auth = auth;
        this.height = height;
        this.sequence = sequence;
        this.body = body;
        this.likes = likes;
        this.dislikes = dislikes;
        this.ref = ref;
        this.error = error;
    }
}


function parsePostTransaction(channelLock: string, height: number, hash: string, transaction: string): Post | undefined {
    let tx = decodeTransactionBCH(hexToBin(transaction))
    if (typeof tx == "string") return new Post({ height: height, hash: hash, error: tx })
    if (!tx.outputs[0]!.token) return new Post({ height: height, hash: hash, error: "no token in first output" })
    if (!tx.outputs[0]!.token.nft) return new Post({ height: height, hash: hash, error: "no nft on first output" })
    if (!tx.outputs[0]!.token.nft.commitment) return new Post({ height: height, hash: hash, error: "no nft commitment first output" })

    let body = ""
    let ref = ""
    let like = 0;
    let dislike = 0;

    const code = tx.outputs
        .filter(o => binToHex(o.lockingBytecode) == channelLock)
        .filter(o => o.token)
        .filter(o => o.token?.nft)
        .map(o => {
            return binToHex(o.token?.nft?.commitment!)
        })
    if (!code) return
    if (!code[0]) return
    // V0
    if (code[0].slice(0, 8) == "6a025630") body = code.map(c => binToUtf8(hexToBin(c.slice(10))))[0]!
    // V+
    if (code[0].slice(0, 8) == "6a02562B") {
        ref = code.map(c => binToUtf8(hexToBin(c.slice(10))))[0]!
        like += 1
    }
    // V-
    if (code[0].slice(0, 8) == "6a02562D") ref = code.map(c => binToUtf8(hexToBin(c.slice(10))))[0]!


    return new Post({
        hash: hash,
        auth: binToHex(tx.outputs[0]?.token?.category!),
        body: body,
        height: height,
        sequence: tx.inputs[0]?.sequenceNumber,
        ref: ref,
        likes: like,
        dislikes: dislike,

    })
}

/**
 * Build a list of top level posts given a list of transactions
 *
 * @param prefix - cashaddress prefix.
 * @throws {Error} if transaction generation fails.
 * @returns a cashaddress.  
 */


export function buildChannel(
    history: AddressGetHistoryEntry[],
    transactions: TransactionHex[],
    channel: string
): Post[] {


    const channelLock = binToHex(Channel.getLockingBytecode(channel))
    // build a map of transactions by hash
    const transactionMap = new Map(transactions.map(tx => [swapEndianness(binToHex(hash256(hexToBin(tx)))), tx]));

    // Assuming a sorted list of transactions by block height

    let posts = history
        .map(h => {
            return parsePostTransaction(channelLock, h.height, h.tx_hash, transactionMap.get(h.tx_hash)!)
        })
        .filter(p => p != undefined)
    return posts
}


export class Channel {

    static USER_AGENT = packageInfo.name;

    static tokenAware = true;

    static template = template;

    static compiler: CompilerBCH = getLibauthCompiler(this.template);

    static vm = createVirtualMachineBCH();

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

    static getScriptHash(channel?: string, reversed = true): string {
        return getScriptHash(this.getLockingBytecode(channel), reversed)
    }

    /**
     * Get cashaddress
     *
     * @param prefix - cashaddress prefix.
     * @throws {Error} if transaction generation fails.
     * @returns a cashaddress.  
     */

    static getAddress(channel?: string, prefix = "bitcoincash" as CashAddressNetworkPrefix): string {
        return getAddress(this.getLockingBytecode(channel), prefix, this.tokenAware)
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


    static getWalletSourceOutput(utxo: UtxoI, key?: string): Output {

        const lockingBytecode = key ? hdPrivateKeyToP2pkhLockingBytecode({
            addressIndex: 0,
            hdPrivateKey: key
        }) : Uint8Array.from(Array(33))

        return {
            lockingBytecode: lockingBytecode,
            valueSatoshis: BigInt(utxo.value),
            token: utxo.token_data ? {
                category: hexToBin(utxo.token_data.category!),
                amount: BigInt(utxo.token_data.amount!),
                nft: utxo.token_data.nft ? {
                    commitment: hexToBin(utxo.token_data.nft.commitment!),
                    capability: utxo.token_data.nft.capability,
                } : undefined
            } : undefined
        }
    }

    static getCouponOutput(utxo: UtxoI, isPremature: boolean): OutputTemplate<CompilerBCH> {

        let futureTime = utxo.value / 10 * 1000
        let outputValue = isPremature ? utxo.value * 10 : utxo.value
        let couponThreshold = isPremature ? 100000000 : 10000000

        let lockingBytecode = this.getCouponLockingBytecode(futureTime, couponThreshold)

        return {
            lockingBytecode: lockingBytecode,
            valueSatoshis: BigInt(outputValue),
        }
    }

    static getCouponOutputs(utxos: UtxoI[], isPremature: boolean): OutputTemplate<CompilerBCH>[] {
        return utxos.map(u => this.getCouponOutput(u, isPremature))
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

    static getWalletInputs(utxos: UtxoI[], key?: string): InputTemplate<CompilerBCH>[] {
        return utxos.map(u => this.getWalletInput(u, key))
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

        //@ts-ignore
        unlockingData.token = utxo.token_data ? {
            category: hexToBin(utxo.token_data.category!),
            amount: BigInt(utxo.token_data.amount!),
            nft: utxo.token_data.nft ? {
                commitment: hexToBin(utxo.token_data.nft.commitment!),
                capability: utxo.token_data.nft.capability,
            } : undefined
        } : undefined



        return {
            outpointIndex: utxo.tx_pos,
            outpointTransactionHash: hexToBin(utxo.tx_hash),
            sequenceNumber: 0,
            unlockingBytecode: unlockingData,
        } as InputTemplate<CompilerBCH>
    }

    static getChannelMessageOutputs(channel: string, message: string, auth: UtxoI, couponValue: number): OutputTemplate<CompilerBCH>[] {
        return message.match(/.{35}/g)?.map((m) => {
            return {
                lockingBytecode: this.getLockingBytecode(channel),
                valueSatoshis: BigInt(couponValue),
                token: {
                    amount: 0n,
                    category: hexToBin(auth.token_data!.category),
                    nft: {
                        capability: 'mutable',
                        commitment: hexToBin("6a025630" + encodeDataPush(utf8ToBin(m)))
                    }
                }
            }
        }) as OutputTemplate<CompilerBCH>[]

    }

    static getChangeOutput(auth: UtxoI, changeAmount: bigint, privateKey?: any, addressIndex = 0): OutputTemplate<CompilerBCH> {

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
            valueSatoshis: changeAmount,
            token: {
                amount: 0n,
                category: hexToBin(auth.token_data!.category),
                nft: {
                    capability: "minting",
                    commitment: hexToBin(auth.token_data?.nft?.commitment!)
                }
            }
        }

    }


    static clear(channel: string, utxos: UtxoI[]): string {

        const inputs: InputTemplate<CompilerBCH>[] = [];
        const outputs: OutputTemplate<CompilerBCH>[] = [];

        inputs.push(... this.getInputs(channel, utxos));
        outputs.push(... this.getCouponOutputs(utxos, false));

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

    static post(channel: string, message: string, auth: UtxoI, key?: string, extraUtxos?: UtxoI[],  fee = 1) {

        const inputs: InputTemplate<CompilerBCH>[] = [];
        const outputs: OutputTemplate<CompilerBCH>[] = [];
        const sourceOutputs: Output[] = [];

        let config = {
            locktime: 0,
            version: 2,
            inputs,
            outputs
        }

        let walletUtxos = [auth]
        if (extraUtxos) walletUtxos.push(...extraUtxos)
        inputs.push(... this.getWalletInputs(walletUtxos, key));
        sourceOutputs.push(... this.getSourceOutputs(channel, walletUtxos))
        outputs.push(... this.getChannelMessageOutputs(channel, message, auth, 10000))
        let valueIn = sumSourceOutputValue(sourceOutputs)

        outputs.push(this.getChangeOutput(auth, valueIn - BigInt(outputs.length * 10000), key))

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
        
        return {
            sourceOutputs: sourceOutputs,
            transaction: transaction,
            verify: verify
        }
    }




}
