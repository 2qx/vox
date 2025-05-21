import {
    addressContentsToLockingBytecode,
    decodePrivateKeyWif,
    generateSigningSerializationBCH,
    hash160,
    hash256,
    LockingBytecodeType,
    Output,
    Transaction,
    secp256k1,
    SigningSerializationFlag
} from '@bitauth/libauth';
import { scriptToBytecode } from './script.js';

import {
    Unlocker,
    GenerateUnlockingBytecodeOptions,
    HashType,
    SignatureAlgorithm,
} from './types.js';


export function createSighashPreimage(
    transaction: Transaction,
    sourceOutputs: Output[],
    inputIndex: number,
    coveredBytecode: Uint8Array,
    hashtype: number,
): Uint8Array {
    const context = { inputIndex, sourceOutputs, transaction };
    const signingSerializationType = new Uint8Array([hashtype]);

    const sighashPreimage = generateSigningSerializationBCH(context, { coveredBytecode, signingSerializationType });

    return sighashPreimage;
}

export function publicKeyToP2PKHLockingBytecode(publicKey: Uint8Array): Uint8Array {
    const pubkeyHash = hash160(publicKey);
    const addressContents = { payload: pubkeyHash, type: LockingBytecodeType.p2pkh };
    const lockingBytecode = addressContentsToLockingBytecode(addressContents);
    return lockingBytecode;
}

export default class SignatureTemplate {
    public privateKey: Uint8Array;

    constructor(
        signer: Keypair | Uint8Array | string,
        private hashtype: HashType = HashType.SIGHASH_ALL | HashType.SIGHASH_UTXOS,
        private signatureAlgorithm: SignatureAlgorithm = SignatureAlgorithm.SCHNORR,
    ) {
        if (isKeypair(signer)) {
            const wif = signer.toWIF();
            this.privateKey = decodeWif(wif);
        } else if (typeof signer === 'string') {
            this.privateKey = decodeWif(signer);
        } else {
            this.privateKey = signer;
        }
    }

    // TODO: Allow signing of non-transaction messages (i.e. don't add the hashtype)
    generateSignature(payload: Uint8Array, bchForkId?: boolean): Uint8Array {
        const signature = this.signatureAlgorithm === SignatureAlgorithm.SCHNORR
            ? secp256k1.signMessageHashSchnorr(this.privateKey, payload) as Uint8Array
            : secp256k1.signMessageHashDER(this.privateKey, payload) as Uint8Array;

        return Uint8Array.from([...signature, this.getHashType(bchForkId)]);
    }

    getHashType(bchForkId: boolean = true): number {
        return bchForkId ? (this.hashtype | SigningSerializationFlag.forkId) : this.hashtype;
    }

    getSignatureAlgorithm(): SignatureAlgorithm {
        return this.signatureAlgorithm;
    }

    getPublicKey(): Uint8Array {
        return secp256k1.derivePublicKeyCompressed(this.privateKey) as Uint8Array;
    }

    unlockP2PKH(): Unlocker {
        const publicKey = this.getPublicKey();
        const prevOutScript = publicKeyToP2PKHLockingBytecode(publicKey);
        const hashType = this.getHashType();

        return {
            generateLockingBytecode: () => prevOutScript,
            generateUnlockingBytecode: ({ transaction, sourceOutputs, inputIndex }: GenerateUnlockingBytecodeOptions) => {
                const preimage = createSighashPreimage(transaction, sourceOutputs, inputIndex, prevOutScript, hashType);
                const sighash = hash256(preimage);
                const signature = this.generateSignature(sighash);
                const unlockingBytecode = scriptToBytecode([signature, publicKey]);
                return unlockingBytecode;
            },
        };
    }
}

interface Keypair {
    toWIF(): string;
}

function isKeypair(obj: any): obj is Keypair {
    return typeof obj.toWIF === 'function';
}

function decodeWif(wif: string): Uint8Array {
    const result = decodePrivateKeyWif(wif);

    if (typeof result === 'string') {
        throw new Error(result);
    }

    return result.privateKey;
}