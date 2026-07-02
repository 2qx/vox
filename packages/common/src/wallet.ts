import {
    binToHex,
    CompilerBch,
    deriveHdPath,
    deriveHdPrivateNodeFromSeed,
    deriveHdPublicKey,
    deriveSeedFromBip39Mnemonic,
    encodeHdPrivateKey,
    hdPrivateKeyToP2pkhLockingBytecode,
    hexToBin,
    InputTemplate,
    OutputTemplate,
    Output
} from '@bitauth/libauth';

import { compiler } from './auth.js';
import { UtxoI } from './types.js'

import {
    checkForEmptySeed,
    getDistinctFungibleTokenCategories,
    sumOutputTokenAmounts,
    sumOutputValue,
    sumSourceOutputTokenAmounts,
    sumSourceOutputValue,
    tokenDifference
} from './util.js';


export function getHdPrivateKey(mnemonic: string, path: string, isTestnet = false) {

    if (mnemonic.length == 0)
        throw Error("refusing to create wallet from empty mnemonic");
    const seed = deriveSeedFromBip39Mnemonic(mnemonic!);
    checkForEmptySeed(seed);

    const network = isTestnet ? "testnet" : "mainnet";
    let hdNode = deriveHdPrivateNodeFromSeed(seed);
    if (typeof hdNode == "string") throw Error(hdNode)
    const zerothChildParent = deriveHdPath(hdNode, path);

    let result = encodeHdPrivateKey({
        network: network,
        node: zerothChildParent
    })
    if (typeof result == "string") throw Error(result)
    return result.hdPrivateKey

}


export function getWalletLayers(
    config: {
        locktime: number;
        version: number;
        inputs: InputTemplate<CompilerBch>[];
        outputs: OutputTemplate<CompilerBch>[];
    },
    sourceOutputs: Output[],
    walletUtxos: UtxoI[],
    privateKey?: string,
    addressIndex?: number
): {
    locktime: number;
    version: number;
    inputs: InputTemplate<CompilerBch>[];
    outputs: OutputTemplate<CompilerBch>[];
} {
    // Calculate excess cash and tokens required to fund the exchange
    let sumSatsOut = sumOutputValue(config.outputs)
    let sumSatsIn = sumSourceOutputValue(sourceOutputs)
    let satsRequired = sumSatsOut - sumSatsIn

    const satsIn = getWalletInputs(walletUtxos, satsRequired, undefined, privateKey, addressIndex)
    config.inputs.push(...satsIn.inputs);
    sourceOutputs.push(...satsIn.sourceOutputs);

    let tokenCategories = getDistinctFungibleTokenCategories(sourceOutputs, config.outputs)

    for (const asset in tokenCategories) {

        let tokensRequired = tokenDifference(sourceOutputs, config.outputs, asset)

        if (tokensRequired > 0n) {
            const tokensIn = getWalletInputs(walletUtxos, tokensRequired, asset, privateKey, addressIndex)
            config.inputs.push(...tokensIn.inputs);
            sourceOutputs.push(...tokensIn.sourceOutputs);
        }

        let tokenChange = -tokenDifference(sourceOutputs, config.outputs, asset)

        if (tokenChange > 0) {
            config.outputs.push(getChangeOutput(800n, tokenChange, asset, privateKey, addressIndex))
        }
    }


    // Calculate excess cash and tokens to be returned as change
    sumSatsOut = sumOutputValue(config.outputs)
    sumSatsIn = sumSourceOutputValue(sourceOutputs)
    let cashChange = sumSatsIn - sumSatsOut
    config.outputs.push(getChangeOutput(cashChange, 0n, undefined, privateKey))

    return config
}

export function getWalletInputs(
    utxos: UtxoI[],
    amount: bigint,
    category?: Uint8Array | string,
    privateKey?: string,
    addressIndex: number = 0,
    sourceOutputs: Output[] = []
): {
    inputs: InputTemplate<CompilerBch>[],
    outputs: OutputTemplate<CompilerBch>[],
    sourceOutputs: Output[]
} {

    let inputs: InputTemplate<CompilerBch>[] = [];
    let outputs: OutputTemplate<CompilerBch>[] = [];

    if (category && typeof category !== "string") category = binToHex(category)
    // Only use straight sat utxos if placing Bch
    if (!category) {
        utxos = utxos.filter(u => !u.token_data)
    } else {
        utxos = utxos
            .filter(u => u.token_data && u.token_data?.category == category)
            // Must not contain NFTs
            .filter(u => u.token_data && !u.token_data.nft)
    }

    // TODO: sort by highest value first
    if (utxos.length == 0) throw Error("no wallet utxos left, maximum recursion depth reached.");

    // get a random utxo.
    const randomIdx = Math.floor(Math.random() * utxos.length)
    const randomUtxo = utxos[randomIdx]!

    // remove the random utxo in place
    utxos.splice(randomIdx, 1);

    // spend the utxo
    inputs.push(getWalletInput(randomUtxo, privateKey, addressIndex))
    sourceOutputs.push(getWalletSourceOutput(randomUtxo, privateKey, addressIndex));
    let sumSats = sumSourceOutputValue(sourceOutputs)
    let sumTokenAmounts = sumSourceOutputTokenAmounts(sourceOutputs, category)
    if (
        // collecting tokens, but the amount is not sufficient
        (category && sumTokenAmounts < amount) ||
        // or collecting sats and not enough sats inputs 
        (!category && sumSats < amount)
    ) {
        // to it again
        let nextTry = getWalletInputs(
            [...utxos],
            amount,
            category,
            privateKey,
            addressIndex,
            [...sourceOutputs]
        )
        inputs.push(...nextTry.inputs)
        outputs.push(...nextTry.outputs)
        sourceOutputs = nextTry.sourceOutputs
    }
    return { inputs, outputs, sourceOutputs }
}

export function getWalletInput(utxo: UtxoI, privateKey?: string, addressIndex = 0): InputTemplate<CompilerBch> {

    let unlockingData = privateKey ? {
        compiler: compiler,
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
        token: utxo.token_data ? {
            category: hexToBin(utxo.token_data.category!),
            amount: BigInt(utxo.token_data.amount),
            nft: utxo.token_data.nft ? {
                commitment: hexToBin(utxo.token_data.nft.commitment!),
                capability: utxo.token_data.nft.capability,
            } : undefined
        } : undefined
    } : Uint8Array.from(Array())

    return {
        outpointIndex: utxo.tx_pos,
        outpointTransactionHash: hexToBin(utxo.tx_hash),
        sequenceNumber: 0,
        unlockingBytecode: unlockingData,
    } as InputTemplate<CompilerBch>
}

export function getChangeOutput(
    value: bigint,
    amount: bigint,
    category?: Uint8Array | string,
    privateKey?: any,
    addressIndex = 0
): OutputTemplate<CompilerBch> {
    if (category && typeof category !== "string") category = binToHex(category);
    const lockingBytecode = privateKey ? {
        compiler: compiler,
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
        valueSatoshis: value,
        token: amount > 0 && category ? {
            category: hexToBin(category),
            amount: amount
        } : undefined
    }
}

export function getWalletSourceOutput(utxo: UtxoI, key?: string, addressIndex = 0): Output {

    const lockingBytecode = key ? hdPrivateKeyToP2pkhLockingBytecode({
        addressIndex: addressIndex,
        hdPrivateKey: key,
        throwErrors: true
    }) : Uint8Array.from(Array(33))


    return {
        lockingBytecode: lockingBytecode,
        valueSatoshis: BigInt(utxo.value),
        token: utxo.token_data ? {
            category: hexToBin(utxo.token_data!.category!),
            amount: BigInt(utxo.token_data!.amount!),
            nft: utxo.token_data.nft ? {
                commitment: hexToBin(utxo.token_data.nft.commitment!),
                capability: utxo.token_data.nft.capability,
            } : undefined
        } : undefined
    }

}