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


    static parseNFT(utxo: UtxoI): BytecodeDataI {

        if (utxo.token_data?.nft?.commitment) {
            let byteData = decodePushBytes(hexToBin(utxo.token_data?.nft?.commitment))
            if (binToUtf8(byteData[0]!) !== this.PROTOCOL_IDENTIFIER) throw Error("Non-subscription record NFT passed as subscription")
            return {
                "open": byteData[1]!,
                "recipient": byteData[2]!
            }
        } else {
            throw Error("Could not parse subscription NFT")
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
        record: UtxoI,
        reversed = true): string {
        let data = this.parseNFT(record)
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

    static getChangeOutput(
        value: bigint,
        utxo: UtxoI,
        privateKey?: any,
        addressIndex = 0
    ): OutputTemplate<CompilerBch> {

        const lockingBytecode = privateKey ? {
            compiler: this.compiler,
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
            token: utxo.token_data ? {
                category: hexToBin(utxo.token_data.category!),
                amount: BigInt(utxo.token_data.amount),
                nft: utxo.token_data.nft ? {
                    commitment: hexToBin(utxo.token_data.nft.commitment!),
                    capability: utxo.token_data.nft.capability,
                } : undefined
            } : undefined
        }
    }



    static getWalletInputs(
        utxos: UtxoI[],
        amount: bigint,
        sourceOutputs: Output[] = [],
        privateKey?: string,
        addressIndex = 0,
    ): {
        inputs: InputTemplate<CompilerBch>[],
        outputs: OutputTemplate<CompilerBch>[],
        sourceOutputs: Output[]
    } {

        let inputs: InputTemplate<CompilerBch>[] = [];
        let outputs: OutputTemplate<CompilerBch>[] = [];


        // Only use straight sat utxos
        utxos = utxos.filter(u => !u.token_data)

        // TODO: sort by highest value first
        if (utxos.length == 0) throw Error("no wallet utxos left, maximum recursion depth reached.");

        // get a random utxo.
        const randomIdx = Math.floor(Math.random() * utxos.length)
        const randomUtxo = utxos[randomIdx]!

        // remove the random utxo in place
        utxos.splice(randomIdx, 1);

        // spend the utxo
        inputs.push(getWalletInput(randomUtxo, privateKey, addressIndex))
        sourceOutputs.push(getWalletSourceOutput(randomUtxo, privateKey, addressIndex));
        let sumSats = sumSourceOutputValue(sourceOutputs)
        if (
            // or collecting sats and not enough sats inputs 
            (sumSats < amount)
        ) {
            // to it again
            let nextTry = this.getWalletInputs(
                [...utxos],
                amount,
                [...sourceOutputs],
                privateKey,
                addressIndex
            )
            inputs.push(...nextTry.inputs)
            outputs.push(...nextTry.outputs)
            sourceOutputs = nextTry.sourceOutputs
        }
        return { inputs, outputs, sourceOutputs }
    }

    static getWalletLayers(
        utxo: UtxoI,
        config: {
            locktime: number;
            version: number;
            inputs: InputTemplate<CompilerBch>[];
            outputs: OutputTemplate<CompilerBch>[];
        },
        sourceOutputs: Output[],
        walletUtxos: UtxoI[],
        privateKey?: string,
        addressIndex = 0
    ) {
        // Calculate excess cash and tokens required to fund the exchange
        let sumSatsOut = sumOutputValue(config.outputs)
        let sumSatsIn = sumSourceOutputValue(sourceOutputs)
        let satsRequired = sumSatsOut - sumSatsIn

        const satsIn = this.getWalletInputs(walletUtxos, satsRequired, undefined, privateKey, addressIndex)
        config.inputs.push(...satsIn.inputs);
        sourceOutputs.push(...satsIn.sourceOutputs);


        // Calculate excess cash and tokens to be returned as change
        sumSatsOut = sumOutputValue(config.outputs)
        sumSatsIn = sumSourceOutputValue(sourceOutputs)
        let cashChange = sumSatsIn - sumSatsOut

        config.outputs.push(this.getChangeOutput(cashChange, utxo, privateKey, addressIndex))

        return config
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
        record: UtxoI,
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

        const data = this.parseNFT(record)

        let age = height - utxo.height
        let outputValue = Math.round(binToNumberUintLE(data["open"]!) / age) + 1


        const sourceOutputs = [this.getSourceOutput(data, utxo)];
        config.inputs.push(this.getInput(data, utxo, age));

        // Cash out the consignor
        config.outputs.push(this.getOutput(data, outputValue));

        config = this.getWalletLayers(utxo, config, sourceOutputs, walletUtxos, privateKey, addressIndex);

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