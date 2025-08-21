import template from './template.v2.json' with { type: "json" };
import packageInfo from '../package.json' with { type: "json" };

import {
    bigIntToVmNumber,
    binToHex,
    binToUtf8,
    CompilerBCH,
    createVirtualMachineBCH,
    deriveHdPublicKey,
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
    utf8ToBin,
    encodeDataPush,
    lockingBytecodeToCashAddress
} from "@bitauth/libauth"

import {
    getTransactionFees,
    getAddress,
    type CashAddressNetworkPrefix,
    getLibauthCompiler,
    getScriptHash,
    sumSourceOutputValue,
    sumOutputValue,
    type UtxoI,
    type TransactionHex,
    type AddressGetHistoryEntry
} from '@unspent/tau';

import { Coupon } from './coupon.js';
import { Vault } from './vault.js';
import { toBin } from './util.js';

const BIP68_MASK = 2147483648

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
        this.sequence = sequence > BIP68_MASK ? sequence - BIP68_MASK : sequence;
        this.body = body;
        this.likes = likes;
        this.dislikes = dislikes;
        this.ref = ref;
        this.error = error;
    }
}


function parsePostTransaction(
    channelLock: string,
    height: number,
    hash: string,
    transaction: string
): Post | undefined {

    if (!transaction) return 
    let tx = decodeTransactionBCH(hexToBin(transaction))
    if (typeof tx == "string") return new Post({ height: height, hash: hash, error: tx })
    if (!tx.outputs[0]!.token) return 
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
    if (code[0].slice(0, 8) == "6a025630") body = code.map(c => binToUtf8(hexToBin(c.slice(10)))).join("")
    // V+
    if (code[0].slice(0, 8) == "6a02562B") {
        ref = code.map(c => binToUtf8(hexToBin(c.slice(10))))[0]!
        like = 1
    }
    // V-
    if (code[0].slice(0, 8) == "6a02562D") {
        ref = code.map(c => binToUtf8(hexToBin(c.slice(10))))[0]!
        dislike = 1
    }

    return new Post({
        hash: hash,
        auth: binToHex(tx.outputs[0]?.token?.category!),
        body: body,
        height: height,
        sequence: tx.inputs[0]?.sequenceNumber!,
        ref: ref,
        likes: like,
        dislikes: dislike,
    })
}

function chunkString(str: string, len: number) {
    const size = Math.ceil(str.length / len)
    const r = Array(size)
    let offset = 0

    for (let i = 0; i < size; i++) {
        r[i] = str.substr(offset, len)
        offset += len
    }

    return r
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

    return posts.sort((x, y) => {
        if (x.height === y.height) {
            return x.sequence! - y.sequence!;
        }
        else {
            if (x.height! > 0) {
                return x.height! - y.height!;
            } else {
                return y.height! - x.height!;
            }

        }
    })
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
                    "channel": toBin(channel)
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

    static getAddress(channel = "", prefix = "bitcoincash" as CashAddressNetworkPrefix): string {
        return getAddress(this.getLockingBytecode(channel), prefix, this.tokenAware)
    }


    static getInputs(channel: string, utxos: UtxoI[], edit = false): InputTemplate<CompilerBCH>[] {
        return utxos.map(u => this.getInput(channel, u, edit))
    }

    static getInput(channel: string, utxo: UtxoI, edit = false): InputTemplate<CompilerBCH> {

        let scriptId = edit ? 'edit_message' : 'process_message';
        
        return {
            outpointIndex: utxo.tx_pos,
            outpointTransactionHash: hexToBin(utxo.tx_hash),
            // 
            sequenceNumber: 0,
            unlockingBytecode: {
                compiler: this.compiler,
                script: scriptId,
                data: {
                    "bytecode": {
                        "channel": toBin(channel),
                        "locktime": bigIntToVmNumber(BigInt((Number(utxo.value) / 10) * 1000))
                    }
                },
                valueSatoshis: BigInt(utxo.value),
                token: utxo.token_data ? {
                    category: hexToBin(utxo.token_data.category!),
                    amount: BigInt(utxo.token_data.amount),
                    nft: utxo.token_data.nft ? {
                        commitment: hexToBin(utxo.token_data.nft.commitment!),
                        capability: utxo.token_data.nft.capability,
                    } : undefined
                } : undefined
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
                amount: BigInt(utxo.token_data.amount),
                nft: utxo.token_data.nft ? {
                    commitment: hexToBin(utxo.token_data.nft.commitment!),
                    capability: utxo.token_data.nft.capability,
                } : undefined
            } : undefined
        }
    }

    static getCouponOutputs(utxos: UtxoI[], now: number): OutputTemplate<CompilerBCH>[] {
        return utxos.map(u => this.getCouponOutput(u, now)).filter(u => u !== undefined)
    }

    static getCouponOutput(utxo: UtxoI, now: number): OutputTemplate<CompilerBCH> | undefined {

        let futureTime = Math.floor(utxo.value / 10) * 1000;

        // if the utxo was underfunded, clear it without generating a coupon.
        if ((futureTime - utxo.height) < 1000) return

        let isPremature = futureTime > now;

        let outputValue = isPremature ? utxo.value * 10 : utxo.value;
        let couponThreshold = isPremature ? 100_000_000 : 10_000_000;

        console.log(couponThreshold)
        
       
        let bytecode = Vault.getCouponLockingBytecode(couponThreshold, futureTime)
        console.log(binToHex(Coupon.getUnlockingBytecode(couponThreshold, bytecode)))
        let cashAddResult = lockingBytecodeToCashAddress({prefix:"bchtest",bytecode})
        if(typeof cashAddResult == "string") throw cashAddResult
        console.log(cashAddResult)
        console.log(binToHex(bytecode))
        return {
            lockingBytecode: bytecode,
            valueSatoshis: BigInt(outputValue),
        }
    }


  

    static getWalletInputs(utxos: UtxoI[], key?: string, sequence?: number): InputTemplate<CompilerBCH>[] {
        return utxos.map((u: UtxoI) => this.getWalletInput(u, key, sequence))
    }


    static getWalletInput(utxo: UtxoI, privateKey?: string, sequence?: number, addressIndex = 0): InputTemplate<CompilerBCH> {

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
            amount: utxo.token_data.amount,
            nft: utxo.token_data.nft ? {
                commitment: hexToBin(utxo.token_data.nft.commitment!),
                capability: utxo.token_data.nft.capability,
            } : undefined
        } : undefined

        return {
            outpointIndex: utxo.tx_pos,
            outpointTransactionHash: hexToBin(utxo.tx_hash),
            sequenceNumber: sequence ? sequence + BIP68_MASK : sequence,
            unlockingBytecode: unlockingData,
        } as InputTemplate<CompilerBCH>
    }



    static getChannelMessageOutputs(channel: string, message: string, auth: UtxoI, couponValue: number): OutputTemplate<CompilerBCH>[] {
        let chunks = chunkString(message, 32).map((m) => "6a025630" + binToHex(encodeDataPush(utf8ToBin(m))))
        return chunks.map((m) => {
            return {
                lockingBytecode: this.getLockingBytecode(channel),
                valueSatoshis: BigInt(couponValue),
                token: {
                    amount: 0n,
                    category: hexToBin(auth.token_data!.category),
                    nft: {
                        capability: 'mutable',
                        commitment: hexToBin(m)
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


    /**
     * Clear a channel message.
     * 
     * Messages may be cleared based on different conditions:
     * 
     * 1. Messages that are older than 1000 blocks can be turned into 10M coupons 
     * 1. Messages that are not older than 1000 blocks can be into 100M coupons 
     * 1. Messages that were insufficiently funded may be taken at will without generating a coupon. 
     *
     * @param channel - channel identifier.
     * @param utxos - utxos held by the channel to drop.
     * @param auth - utxo paying transaction fees.
     * @param key - private key to sign transaction wallet inputs.
     * @param now - current timestamp, in blocks.
     * @param extraUtxos - wallet utxos for extra fees.
     * @param fee - network fee to pay, default 1 sat per byte.
     *
     * @throws {Error} if transaction generation fails.
     * @returns a transaction template.
     */

    static clear(channel: string, utxos: UtxoI[], auth: UtxoI, key: string, now: number, extraUtxos?: UtxoI[], fee = 1) {

        const inputs: InputTemplate<CompilerBCH>[] = [];
        const outputs: OutputTemplate<CompilerBCH>[] = [];
        const sourceOutputs: Output[] = [];

        let config = {
            locktime: now,
            version: 2,
            inputs,
            outputs
        }

        let walletUtxos = [auth]
        if (extraUtxos) walletUtxos.push(...extraUtxos)
        config.inputs.push(... this.getInputs(channel, utxos));
        config.inputs.push(... this.getWalletInputs(walletUtxos, key));

        config.outputs.push(... this.getCouponOutputs(utxos, now));

        sourceOutputs.push(... this.getSourceOutputs(channel, utxos));
        sourceOutputs.push(this.getWalletSourceOutput(auth, key));

        let valueIn = sumSourceOutputValue(sourceOutputs)
        let valueOut = sumOutputValue(config.outputs)
        let change = valueIn - valueOut;
        config.outputs.push(this.getChangeOutput(auth, change, key))

        return this.buildAndValidateTransaction(config, sourceOutputs, fee)

    }

    /**
     * Create (or edit) a post.
     *
     * @param channel - channel identifier.
     * @param message - full post message.
     * @param auth - utxo paying transaction fees.
     * @param couponAmount - amount to pay message (per commitment).
     * @param key - private key to sign transaction wallet inputs.
     * @param prevUtxos - post utxos to edit.
     * @param fee - network fee to pay, default 1 sat per byte.
     *
     * @throws {Error} if transaction generation fails.
     * @returns a transaction template.
     */

    static post(channel: string, message: string, auth: UtxoI, couponAmount: number, key?: string, sequence?: number, prevUtxos?: UtxoI[], fee = 1) {

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
        if (prevUtxos) walletUtxos.push(...prevUtxos)

        config.inputs.push(... this.getWalletInputs(walletUtxos, key, sequence));

        config.outputs.push(... this.getChannelMessageOutputs(channel, message, auth, couponAmount));

        sourceOutputs.push(this.getWalletSourceOutput(auth, key));
        let valueIn = sumSourceOutputValue(sourceOutputs)

        let change = valueIn - BigInt(config.outputs.length * couponAmount);
        config.outputs.push(this.getChangeOutput(auth, change, key));

        return this.buildAndValidateTransaction(config, sourceOutputs, fee);

    }

    static buildAndValidateTransaction(config: any, sourceOutputs: Output[], fee = 1) {

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
