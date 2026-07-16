import template from './auth.json' with { type: "json" };

import {
    CompilerBch,
    deriveHdPublicKey,
    hexToBin,
    InputTemplate,
    Output,
    OutputTemplate,
} from '@bitauth/libauth';

import {
    getWalletSourceOutput,
    getLibauthCompiler,
    UtxoI,
    getWalletInput
} from '@unspent/tau';


export const compiler = getLibauthCompiler(template);

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

