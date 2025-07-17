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
    return binToHex(result)
}




