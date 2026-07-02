import template from './template.v3.json' with { type: "json" };
import packageInfo from '../package.json' with { type: "json" };

import {
    binToHex,
    binToUtf8,
    cashAssemblyToBin,
    CompilerBch,
    createVirtualMachineBch,
    deriveHdPublicKey,
    encodeTransactionBch,
    generateTransaction,
    hexToBin,
    InputTemplate,
    OutputTemplate,
    Output,
    Transaction,
    verifyTransactionTokens,
    binToNumberUintLE
} from '@bitauth/libauth';

import {
    BytecodeDataI,
    decodePushBytes,
    getAddress,
    getTransactionFees,
    getWalletInput,
    getWalletSourceOutput,
    sumOutputValue,
    sumSourceOutputValue,
    type CashAddressNetworkPrefix,
    getLibauthCompiler,
    getScriptHash,
    getWalletLayers,
    numToVm,
    UtxoI,
} from '@unspent/tau';

export interface DutchAuctionData {
    open: number,
    recipient: string
}


export default class Dutch {

    static USER_AGENT = packageInfo.name;

    static PROTOCOL_IDENTIFIER = "U3A";

    static tokenAware = true;

    static template = template;

    static compiler: CompilerBch = getLibauthCompiler(this.template);

    static vm = createVirtualMachineBch();

    static dataToBytecode(data: DutchAuctionData) {
        return {
            "open": numToVm(data.open),
            "recipient": hexToBin(data.recipient)
        }
    }


    static parseCommitment(record: string | Uint8Array): BytecodeDataI {

        if (typeof record === "string") record = hexToBin(record)
        const decodedData = decodePushBytes(record)
        if (binToUtf8(decodedData[0]!) !== this.PROTOCOL_IDENTIFIER) throw Error(`"Non-${typeof this} record NFT passed as ${typeof this}"`)
        return {
            "open": decodedData[1]!,
            "recipient": decodedData[2]!,
        }

    }


    static encodeCommitment(data: DutchAuctionData) {
        let commitment = cashAssemblyToBin(
            `<"${this.PROTOCOL_IDENTIFIER}"><${data.open}><0x${data.recipient}>
        `)
        if (typeof commitment === "string") throw commitment
        return binToHex(commitment)
    }


    static getLockingBytecode(
        data: BytecodeDataI
    ): Uint8Array {
        const lockingBytecodeResult = this.compiler.generateBytecode(
            {
                data: {
                    "bytecode": data
                },
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
     * @param open - opening ask.
     * @param recipient - locking bytecode receiving funds.
     * @param reversed - whether to reverse the hash.
     * @throws {Error} if transaction generation fails.
     * @returns a cashaddress.
     */
    static getScriptHash(
        record: string|Uint8Array,
        reversed = true): string {
        let data = this.parseCommitment(record)
        return getScriptHash(this.getLockingBytecode(data), reversed)
    }

    /**
     * Get cashaddress
     *
     * @param data - The auction open and recipient.
     * @param prefix - cashaddress prefix.
     * @throws {Error} if transaction generation fails.
     * @returns a cashaddress.
     */
    static getAddress(
        data: DutchAuctionData,
        prefix = "bitcoincash" as CashAddressNetworkPrefix): string {
        let bytecode = this.dataToBytecode(data)
        return getAddress(this.getLockingBytecode(bytecode), prefix, this.tokenAware)
    }

    static getSourceOutput(
        data: BytecodeDataI,
        utxo: UtxoI
    ): Output {

        return {
            lockingBytecode: this.getLockingBytecode(data),
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

    static getInput(
        data: BytecodeDataI,
        utxo: UtxoI,
        age: number,
    ): InputTemplate<CompilerBch> {

        return {
            outpointIndex: utxo.tx_pos,
            outpointTransactionHash: hexToBin(utxo.tx_hash),
            sequenceNumber: age,
            unlockingBytecode: {
                data: {
                    "bytecode": data
                },
                compiler: this.compiler,
                script: 'unlock',
                valueSatoshis: BigInt(utxo.value),
                token: utxo.token_data ? {
                    category: hexToBin(utxo.token_data.category!),
                    amount: BigInt(utxo.token_data.amount),
                    nft: utxo.token_data.nft ? {
                        commitment: hexToBin(utxo.token_data.nft.commitment!),
                        capability: utxo.token_data.nft.capability,
                    } : undefined
                } : undefined
            },
        } as InputTemplate<CompilerBch>
    }


    static getOutput(data: BytecodeDataI, outputValue: number): OutputTemplate<CompilerBch> {

        return {
            lockingBytecode: data["recipient"]!,
            valueSatoshis: BigInt(outputValue),
        }

    }

    /**
     * Bid on lot records.
     *
     * @param record - The parameters of the auction.
     * @param utxo - utxo being purchased.
     * @param walletUtxos - utxos funding the bid
     * @param privateKey - the wallet key
     * @param addressIndex - index of the address
     * @param free - the default fee
     *
     * @throws {Error} if transaction generation fails.
     * @returns a transaction template.
     */

    static execute(
        record: string|Uint8Array,
        utxo: UtxoI,
        walletUtxos: UtxoI[],
        height: number,
        privateKey?: string,
        addressIndex = 0,
        fee = 1
    ): {
        transaction: Transaction,
        sourceOutputs: Output[],
        verify: string | boolean
    } {

        const inputs: InputTemplate<CompilerBch>[] = [];
        const outputs: OutputTemplate<CompilerBch>[] = [];

        let config = {
            locktime: 0,
            version: 2,
            inputs,
            outputs
        }

        const data = this.parseCommitment(record)

        let age = height - utxo.height
        let outputValue = Math.round(binToNumberUintLE(data["open"]!) / age) + 1


        const sourceOutputs = [this.getSourceOutput(data, utxo)];
        config.inputs.push(this.getInput(data, utxo, age));

        // Cash out the consignor
        config.outputs.push(this.getOutput(data, outputValue));

        config = getWalletLayers(config, sourceOutputs, walletUtxos, privateKey, addressIndex);

        let result = generateTransaction(config);
        if (!result.success) throw new Error('generate transaction failed!, errors: ' + JSON.stringify(result.errors, null, '  '));

        const estimatedFee = getTransactionFees(result.transaction, fee)

        const lastIdx = config.outputs.length - 1
        config.outputs[lastIdx]!.valueSatoshis = config.outputs[lastIdx]!.valueSatoshis - estimatedFee

        result = generateTransaction(config);
        if (!result.success) throw new Error('generate transaction failed!, errors: ' + JSON.stringify(result.errors, null, '  '));


        const transaction = result.transaction
        const tokenValidationResult = verifyTransactionTokens(
            transaction,
            sourceOutputs,
            { maximumTokenCommitmentLength: 40 }
        );
        if (tokenValidationResult !== true) throw tokenValidationResult;

        let verify = this.vm.verify({
            sourceOutputs: sourceOutputs,
            transaction: transaction,
        })

        if (typeof verify == "string") throw verify

        return {
            sourceOutputs: sourceOutputs,
            transaction: transaction,
            verify: verify
        }
    }

}