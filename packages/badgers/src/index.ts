import template from './template.v1.json' with { type: "json" };
import packageInfo from '../package.json' with { type: "json" };

import {
    binToHex,
    CompilerBCH,
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

export const BADGER = hexToBin('242f6ecedb404c743477e35b09733a56cacae34f3109d5cee1cbc1d5630affd7')
export const tBADGER = hexToBin('0000000000000000000000000000000000000000000000000000000000000000')


export default class BadgerStake {

    static USER_AGENT = packageInfo.name;

    static tokenAware = true;

    static template = template;

    static compiler: CompilerBCH = getLibauthCompiler(this.template);

    static vm = createVirtualMachineBCH();

    static getLockingBytecode(): Uint8Array {
        const lockingBytecodeResult = this.compiler.generateBytecode(
            {
                data: {},
                scriptId: 'lock'
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
    static getScriptHash(reversed = true): string {
        return getScriptHash(this.getLockingBytecode(), reversed)
    }

    /**
     * Get cashaddress
     *
     * @param prefix - cashaddress prefix.
     * @throws {Error} if transaction generation fails.
     * @returns a cashaddress.
     */
    static getAddress(prefix = "bitcoincash" as CashAddressNetworkPrefix): string {
        return getAddress(this.getLockingBytecode(), prefix, this.tokenAware)
    }

    static parseNFT(utxo: UtxoI) {
        
        if (utxo.token_data?.nft?.capability == "mutable") {
            return {
                amount: parseInt(utxo.token_data?.amount!),
                stake: binToNumberInt16LE(hexToBin(utxo.token_data?.nft?.commitment.slice(-4)!)),
                user_pkh: utxo.token_data?.nft?.commitment.slice(0, 40)
            }
        } else if (utxo.token_data?.nft?.capability == "minting"){
            return {
                amount: parseInt(utxo.token_data?.amount!),
                stake: binToNumberInt16LE(hexToBin(utxo.token_data?.nft?.commitment.slice(0,4)!)),
                user_pkh: utxo.token_data?.nft?.commitment.slice(-40)
            }
        }else{
            throw Error("Nft was not minting nor mutable")
        }

    }

    static getSourceOutput(utxo: UtxoI): Output {

        return {
            lockingBytecode: this.getLockingBytecode(),
            valueSatoshis: BigInt(utxo.value)
        }

    }

    //, amount: number, blocks: number, userPkh: Uint8Array
    static getInput(utxo: UtxoI): InputTemplate<CompilerBCH> {
        return {
            outpointIndex: utxo.tx_pos,
            outpointTransactionHash: hexToBin(utxo.tx_hash),
            sequenceNumber: utxo.value,
            unlockingBytecode: {
                data: {
                    // "bytecode": {
                    //     "amount": bigIntToVmNumber(BigInt(amount)),
                    //     "stake": numberToBinUint16BE(blocks),
                    //     "user_pkh": userPkh
                    // }
                },
                compiler: this.compiler,
                script: 'unlock',
                valueSatoshis: BigInt(utxo.value),
            },
        } as InputTemplate<CompilerBCH>
    }

    static getOutput(): OutputTemplate<CompilerBCH> {

        return {
            lockingBytecode: {
                data: {
                    // "bytecode": {
                    //     "key": hexToBin(indexKey)
                    // }
                },
                compiler: this.compiler,
                script: 'op_return'
            },
            valueSatoshis: BigInt(0)
        }

    }

    /**
     * Get source outputs, transform contract & wallet outpoints for spending verification.
     *
     * @param contractUtxo - contract outputs to use as input.
     * @param walletUtxo - wallet outputs to use as input.
     * @param key - private key to sign transaction wallet inputs.
     *
     * @returns a transaction template.
     */

    static getSourceOutputs(
        valueUtxos: UtxoI[]
    ): Output[] {
        const sourceOutputs: Output[] = [];
        sourceOutputs.push(...valueUtxos.map((u: UtxoI) => this.getSourceOutput(u)));
        return sourceOutputs
    }

    /**
     * Unlock completed stake.
     *
     * @param utxo - unspent contract record to payout.
     *
     * @throws {Error} if transaction generation fails.
     * @returns a transaction template.
     */

    static unlock(
        utxo: UtxoI
    ): string {

        const inputs: InputTemplate<CompilerBCH>[] = [];
        const outputs: OutputTemplate<CompilerBCH>[] = [];

        let config = {
            locktime: 0,
            version: 2,
            inputs,
            outputs
        }

        config.inputs.push(this.getInput(utxo));
        config.outputs.push(this.getOutput());

        let result = generateTransaction(config);
        if (!result.success) throw new Error('generate transaction failed!, errors: ' + JSON.stringify(result.errors, null, '  '));

        const sourceOutputs = [this.getSourceOutput(utxo)];

        const transaction = result.transaction
        const tokenValidationResult = verifyTransactionTokens(
            transaction,
            sourceOutputs
        );
        if (tokenValidationResult !== true) throw tokenValidationResult;

        let verify = this.vm.verify({
            sourceOutputs: sourceOutputs,
            transaction: transaction,
        })

        if (typeof verify == "string") throw verify
        return binToHex(encodeTransactionBCH(transaction))
    }

}