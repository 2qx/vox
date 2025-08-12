import {
    //binToHex,
    deriveSeedFromBip39Mnemonic,
    deriveHdPrivateNodeFromSeed,
    deriveHdPath,
    encodeHdPrivateKey,
    //encodeHdPublicKey,
    // deriveHdPublicNode,
    // hash160,
    // deriveHdPrivateNodeChild
} from "@bitauth/libauth";
import { checkForEmptySeed } from "./util.js";

export function getHdPrivateKey(mnemonic:string, path:string, isTestnet=false) {

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
