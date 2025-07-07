import {
    binToHex,
    deriveHdPublicKey,
    hexToBin,
    secp256k1,
    CompilationData
} from "@bitauth/libauth";


export function derivePublicKey(privateKey: string | Uint8Array): string {
    if (typeof privateKey == "string") privateKey = hexToBin(privateKey);
    let result = secp256k1.derivePublicKeyCompressed(privateKey);
    if (typeof result == "string") throw Error(result)
    console.log(result)
    return binToHex(result)
}



export function getWalletCompilationData(privateKey: string) {

    let derived = deriveHdPublicKey(privateKey)

    const walletLockingData: CompilationData<never> = {
        hdKeys: {
            addressIndex: 0, hdPublicKeys: {
                'wallet': derived.hdPublicKey
            },
        },
    };

    const walletUnlockingData: CompilationData<never> = {
        ...walletLockingData,
        hdKeys: {
            ...walletLockingData.hdKeys,
            hdPrivateKeys: {
                'wallet': privateKey
            },
        },
    };
    return { lockData: walletLockingData, unlockData: walletUnlockingData }

}