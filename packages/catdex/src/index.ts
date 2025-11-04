import template from './template.v3.json' with { type: "json" };
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

export default class CatDex {

    static USER_AGENT = packageInfo.name;

    static PROTOCOL_IDENTIFIER = "U3X";

    static tokenAware = true;

    static template = template;

    static compiler: CompilerBch = getLibauthCompiler(this.template);

    static vm = createVirtualMachineBCH();

    static getLockingBytecode(authCat: Uint8Array|string): Uint8Array {
        if(typeof authCat == "string") authCat = hexToBin(authCat)
        const lockingBytecodeResult = this.compiler.generateBytecode(
            {
                data: {
                    "bytecode": {
                        "auth_category": authCat
                    }
                },
                scriptId: 'catdex_blackboard'
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
    static getScriptHash(authCat: Uint8Array|string, reversed = true): string {
        return getScriptHash(this.getLockingBytecode(authCat), reversed)
    }

    /**
     * Get cashaddress
     *
     * @param prefix - cashaddress prefix.
     * @throws {Error} if transaction generation fails.
     * @returns a cashaddress.
     */
    static getAddress(authCat: Uint8Array|string, prefix = "bitcoincash" as CashAddressNetworkPrefix): string {
        return getAddress(this.getLockingBytecode(authCat), prefix, this.tokenAware)
    }

}