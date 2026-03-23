import template from './auth.json' with { type: "json" };

import {
    binToHex,
    CompilerBch,
    deriveHdPublicKey,
    hdPrivateKeyToP2pkhLockingBytecode,
    hexToBin,
    InputTemplate,
    Output,
    OutputTemplate,
} from '@bitauth/libauth';

import {
    getLibauthCompiler,
    UtxoI,
} from '@unspent/tau';


let compiler = getLibauthCompiler(template);

export function getAuthLayers(
    authUtxo: UtxoI,
    privateKey?: any,
    addressIndex = 0,
): {
    inputs: InputTemplate<CompilerBch>[],
    outputs: OutputTemplate<CompilerBch>[],
    sourceOutputs: Output[]
} {
    let inputs: InputTemplate<CompilerBch>[] = [];
    let outputs: OutputTemplate<CompilerBch>[] = [];
    let sourceOutputs: Output[] = []

    sourceOutputs.push(getWalletSourceOutput(authUtxo, privateKey, addressIndex));
    inputs.push(getWalletInput(authUtxo, privateKey, addressIndex))
    outputs.push(getAuthWalletOutput(authUtxo, privateKey, addressIndex))
    return { inputs, outputs, sourceOutputs }
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

export function getAuthWalletOutput(
    utxo: UtxoI,
    privateKey?: any,
    addressIndex = 0,
): OutputTemplate<CompilerBch> {

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
        valueSatoshis: BigInt(utxo.value),
        token: utxo.token_data ? {
            category: hexToBin(utxo.token_data!.category!),
            amount: BigInt(utxo.token_data.amount),
            nft: utxo.token_data.nft ? {
                commitment: hexToBin(utxo.token_data.nft.commitment!),
                capability: utxo.token_data.nft.capability,
            } : undefined
        } : undefined
    }
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
            amount: amount,
        } : undefined
    }
}