import template from './template.v0.json' with { type: "json" };
import packageInfo from '../package.json' with { type: "json" };

import {
    binToHex,
    CompilerBch,
    createVirtualMachineBCH,
    encodeTransactionBCH,
    generateTransaction,
    hexToBin,
    InputTemplate,
    OutputTemplate,
    Output,
    verifyTransactionTokens,
    binToNumberInt16LE
} from '@bitauth/libauth';

import {
    getAddress,
    type CashAddressNetworkPrefix,
    getLibauthCompiler,
    getScriptHash,
    UtxoI,
} from '@unspent/tau';

export default class Cauldron {

    static USER_AGENT = packageInfo.name;

    static tokenAware = true;

    static template = template;

    static compiler: CompilerBch = getLibauthCompiler(this.template);

    static vm = createVirtualMachineBCH();

    static getLockingBytecode(ownerPublicKeyHash: Uint8Array): Uint8Array {
        const lockingBytecodeResult = this.compiler.generateBytecode(
            {
                data: {
                    "bytecode": {
                        "pool_pkh": ownerPublicKeyHash
                    }
                },
                scriptId: 'cauldron_covenant'
            })
        if (!lockingBytecodeResult.success) throw new Error(
            'Failed to generate bytecode, script: , ' + JSON.stringify(lockingBytecodeResult, null, '  '
            ));
        return lockingBytecodeResult.bytecode
    }

    /**
     * Get cashaddress
     *
     * @param indexKey - the key for the record.
     * @param reversed - whether to reverse the hash.
     * @throws {Error} if transaction generation fails.
     * @returns a cashaddress.
     */
    static getScriptHash(ownerPublicKeyHash: Uint8Array, reversed = true): string {
        return getScriptHash(this.getLockingBytecode(ownerPublicKeyHash), reversed)
    }

    /**
     * Get cashaddress
     *
     * @param prefix - cashaddress prefix.
     * @throws {Error} if transaction generation fails.
     * @returns a cashaddress.
     */
    static getAddress(ownerPublicKeyHash: Uint8Array, prefix = "bitcoincash" as CashAddressNetworkPrefix): string {
        return getAddress(this.getLockingBytecode(ownerPublicKeyHash), prefix, this.tokenAware)
    }

}