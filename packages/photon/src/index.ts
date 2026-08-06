import template from './template.v3.json' with { type: "json" };
import packageInfo from '../package.json' with { type: "json" };

import {
    binToHex,
    bigIntToVmNumber,
    CompilerBch,
    createVirtualMachineBch2026,
    deriveHdPublicKey,
    generateTransaction,
    hexToBin,
    InputTemplate,
    OutputTemplate,
    Output,
    stringifyDebugTraceSummary,
    summarizeDebugTrace,
    decodeTransactionBch,
    encodeTransactionBch,
    secp256k1,
    sha256,
    hash256,
    swapEndianness,
    deriveHdPrivateNodeChild,
    decodeHdPrivateKey,
    cashAddressToLockingBytecode,
    numberToBinUint32LE,
    deriveHdPublicNodeChild,
    deriveHdPublicNode,
    binToBigIntUintLE,
    verifyTransactionTokens,
} from '@bitauth/libauth';

import {
    getAddress,
    type CashAddressNetworkPrefix,
    binToBigIntUint256LE,
    bigIntToBinUint256LE,
    getChangeOutput,
    getLibauthCompiler,
    getScriptHash,
    getTransactionFees,
    getWalletInputs,
    sumSourceOutputTokenAmounts,
    sumSourceOutputValue,
    sumOutputValue,
    UtxoI,
} from '@unspent/tau';

export const PHOTON_CATEGORY = hexToBin('29972959d6f0dc766cdcb81bfaf8171c5605a64dd0a81fa46080f84ac87c9bef')
export const tPHOTON_CATEGORY = hexToBin('3cfdc81075ec7ea97c8c7438378fbd6a7a4a0bf98bcc2c7031b3581a59d6db5a')


export default class Photon {

    static USER_AGENT = packageInfo.name;

    static tokenAware = true;

    static template = template;

    static compiler: CompilerBch = getLibauthCompiler(this.template);

    static vm = createVirtualMachineBch2026();

    static getLockingBytecode(data = {}): Uint8Array {
        const lockingBytecodeResult = this.compiler.generateBytecode(
            {
                data: data,
                scriptId: 'lock'
            })
        if (!lockingBytecodeResult.success) throw new Error(
            'Failed to generate bytecode, script: , ' + JSON.stringify(lockingBytecodeResult, null, '  '
            ));
        return lockingBytecodeResult.bytecode
    }

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

    static getSourceOutput(utxo: UtxoI): Output {

        return {
            lockingBytecode: this.getLockingBytecode(),
            valueSatoshis: BigInt(utxo.value),
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

    static getOracleInput(utxo: UtxoI): InputTemplate<CompilerBch> {

        return {
            outpointIndex: utxo.tx_pos,
            outpointTransactionHash: hexToBin(utxo.tx_hash),
            sequenceNumber: 0,
            unlockingBytecode: {
                data: {},
                compiler: this.compiler,
                script: 'oracle',
                valueSatoshis: BigInt(utxo.value),
                token: utxo.token_data ? {
                    category: hexToBin(utxo.token_data!.category!),
                    amount: BigInt(utxo.token_data!.amount),
                    nft: utxo.token_data.nft ? {
                        commitment: hexToBin(utxo.token_data.nft.commitment!),
                        capability: utxo.token_data.nft.capability,
                    } : undefined
                } : undefined
            },
        } as InputTemplate<CompilerBch>
    }

    static getInput(utxo: UtxoI, age: number, minerKey: any): InputTemplate<CompilerBch> {

        return {
            outpointIndex: utxo.tx_pos,
            outpointTransactionHash: hexToBin(utxo.tx_hash),
            sequenceNumber: age,
            unlockingBytecode: {
                data: {
                    "bytecode": {
                        "age": bigIntToVmNumber(BigInt(age)),
                    },
                    hdKeys: {
                        addressIndex: 0,
                        hdPrivateKeys: {
                            'miner': minerKey
                        },
                    }
                },
                compiler: this.compiler,
                script: 'unlock',
                valueSatoshis: BigInt(utxo.value),
                token: utxo.token_data ? {
                    category: hexToBin(utxo.token_data!.category!),
                    amount: BigInt(utxo.token_data!.amount),
                    nft: utxo.token_data.nft ? {
                        commitment: hexToBin(utxo.token_data.nft.commitment!),
                        capability: utxo.token_data.nft.capability,
                    } : undefined
                } : undefined
            },
        } as InputTemplate<CompilerBch>
    }

    static getNextTarget(utxo: UtxoI, now: number) {

        let age = utxo.height <= 0 ? 0 : now - utxo.height;
        let prevTarget = binToBigIntUint256LE(
            hexToBin(utxo.token_data?.nft?.commitment!).slice(4, 36)!
        )
        return bigIntToBinUint256LE((prevTarget * (BigInt(age) + 143n)) / 144n)

    }


    static getOutput(utxo: UtxoI, amount: number, now: number, minerKey: any, nonce: number): OutputTemplate<CompilerBch> {

        let age = utxo.height <= 0 ? 0 : now - utxo.height;
        const nextTarget = this.getNextTarget(utxo, now)
        let commitment = Uint8Array.from(
            [
                ...numberToBinUint32LE(nonce),
                ...nextTarget
            ])
        let msg_hash = sha256.hash(commitment)
        let parentNode = decodeHdPrivateKey(minerKey)
        if (typeof parentNode == "string") throw parentNode
        let minerNodeChild = deriveHdPrivateNodeChild(parentNode.node, 0)
        let dataSig = secp256k1.signMessageHashSchnorr(minerNodeChild.privateKey, msg_hash)
        if (typeof dataSig == "string") throw dataSig

        return {
            lockingBytecode: {
                data: {
                    "bytecode": {
                        "age": bigIntToVmNumber(BigInt(age)),
                    },
                    hdKeys: {
                        addressIndex: 0,
                        hdPublicKeys: {
                            'miner': deriveHdPublicKey(minerKey).hdPublicKey
                        },
                    },

                },
                compiler: this.compiler,
                script: 'lock'
            },
            valueSatoshis: BigInt(utxo.value - 1500),
            token: {
                category: hexToBin(utxo.token_data!.category!),
                amount: BigInt(utxo.token_data?.amount!) - BigInt(amount),
                nft: {
                    capability: "mutable",
                    commitment: Uint8Array.from([...commitment, ...dataSig])
                }
            }
        }

    }

    static getOracleOutput(utxo: UtxoI, amount: number): OutputTemplate<CompilerBch> {

        return {
            lockingBytecode: {
                data: {
                    // "bytecode": {
                    //     "age": bigIntToVmNumber(BigInt(0)),
                    // },
                    // hdKeys: {
                    //     addressIndex: 0,
                    //     hdPublicKeys: {
                    //         'miner': deriveHdPublicKey(minerKey).hdPublicKey
                    //     },
                    // },

                },
                compiler: this.compiler,
                script: 'lock'
            },
            valueSatoshis: BigInt(utxo.value + amount),
            token: {
                category: hexToBin(utxo.token_data!.category!),
                amount: BigInt(utxo.token_data?.amount!),
                nft: {
                    capability: "mutable",
                    commitment: hexToBin(utxo.token_data?.nft?.commitment!)
                }
            }
        }

    }

    static getRewardOutput(amount: number, rewardAddress?: any, category = PHOTON_CATEGORY): OutputTemplate<CompilerBch> {

        let lockingBytecode = cashAddressToLockingBytecode(rewardAddress)
        if (typeof lockingBytecode == "string") throw lockingBytecode
        return {
            lockingBytecode: lockingBytecode.bytecode,
            valueSatoshis: 700n,
            token: {
                category: category,
                amount: BigInt(amount)
            }
        }

    }


    static topUp( amount: number, contractUtxo: UtxoI, walletUtxos: UtxoI[], privateKey: string, addressIndex = 0, category?: string, fee = 1) {

        const inputs: InputTemplate<CompilerBch>[] = [];
        const outputs: OutputTemplate<CompilerBch>[] = [];

        
        let config = {
            locktime: 0,
            version: 2,
            inputs,
            outputs
        }


        config.inputs.push(this.getOracleInput(contractUtxo));
        config.outputs = [this.getOracleOutput(contractUtxo, amount)];
        const sourceOutputs = [this.getSourceOutput(contractUtxo)];

        const satsIn = getWalletInputs(walletUtxos, BigInt(amount), undefined, privateKey, addressIndex)
        config.inputs.push(...satsIn.inputs);
        sourceOutputs.push(...satsIn.sourceOutputs);
         // Calculate excess cash and tokens to be returned as change
        let sumSatsOut = sumOutputValue(config.outputs)
        let sumSatsIn = sumSourceOutputValue(sourceOutputs)
        let cashChange = sumSatsIn - sumSatsOut
        config.outputs.push(getChangeOutput(cashChange, 0n, undefined, privateKey))



        let result = generateTransaction(config);
        if (!result.success) throw new Error('generate transaction failed!, errors: ' + JSON.stringify(result.errors, null, '  '));
        const estimatedFee = getTransactionFees(result.transaction, fee)
        const lastIdx = config.outputs.length - 1
        config.outputs[lastIdx]!.valueSatoshis = config.outputs[lastIdx]!.valueSatoshis - estimatedFee
        result = generateTransaction(config);

        if (!result.success) throw new Error('generate transaction failed!, errors: ' + JSON.stringify(result.errors, null, '  '));
        let transaction = result.transaction
        
        
        const tokenValidationResult = verifyTransactionTokens(
            transaction,
            sourceOutputs,
            { maximumTokenCommitmentLength: 128 }
        );

        if (tokenValidationResult !== true && fee > 0) throw tokenValidationResult;

        // Skip verification
        // let verify = this.vm.verify({
        //     sourceOutputs: sourceOutputs,
        //     transaction: transaction,
        // })

        let state = this.vm.debug({
            inputIndex: 0,
            sourceOutputs,
            transaction,
        })

        let trace = stringifyDebugTraceSummary(
            summarizeDebugTrace(state.slice(-9)),
        )
        console.log(trace)
        
        let tokenDiff = sumSourceOutputTokenAmounts(sourceOutputs, category) -
            sumSourceOutputTokenAmounts(transaction.outputs, category)
        if (tokenDiff !== 0n) throw Error(`Claiming should not create or destroy tokens, token difference: ${tokenDiff}`)
        return {
            sourceOutputs: sourceOutputs,
            transaction: transaction,
            verify: false
        }
    }

    /**
     * Get transaction template for mining photons. A template is a mining transaction with a zero nonce. 
     *
     * @param now - The current bitcoin block height timestamp (expressed in blocks).
     * @param contractUtxo - contract outputs to use as input.
     * @param minerThrowawayKey - A private key used for signing the nonce message.
     * @param rewardAddress - The P2PKH Cashaddress to receive payouts.
     * @param category - The token category of the photons being mined.
     * @param fee - transaction fee to pay (per byte); default 1 sat/byte.
     *
     * @throws {Error} if transaction generation fails.
     * @returns a transaction template.
     */

    static generateTemplate(
        now: number,
        contractUtxo: UtxoI,
        minerThrowawayKey: string,
        rewardAddress: string,
        category?: string,
        nonce = 0
    ): string {

        const inputs: InputTemplate<CompilerBch>[] = [];
        const outputs: OutputTemplate<CompilerBch>[] = [];

        let photonCat = category ? hexToBin(category) : PHOTON_CATEGORY

        let age = contractUtxo.height <= 0 ? 0 : now - contractUtxo.height;

        const rewardAmount = Math.floor(Number(BigInt(contractUtxo.token_data!.amount!) / 420000n)) - 1

        let config = {
            locktime: 0,
            version: 2,
            inputs,
            outputs
        }
        config.inputs.push(this.getInput(contractUtxo, age, minerThrowawayKey));
        config.outputs = [this.getOutput(contractUtxo, rewardAmount, now, minerThrowawayKey, nonce)];
        config.outputs.push(this.getRewardOutput(rewardAmount, rewardAddress, photonCat));
        let result = generateTransaction(config);
        if (!result.success) throw new Error('generate transaction failed!, errors: ' + JSON.stringify(result.errors, null, '  '));
        let transaction = result.transaction
        const sourceOutputs = [this.getSourceOutput(contractUtxo)];


        // let state = this.vm.debug({
        //     inputIndex: 0,
        //     sourceOutputs,
        //     transaction,
        // })

        // let trace = stringifyDebugTraceSummary(
        //     summarizeDebugTrace(state.slice(-9)),
        // )
        // console.log(trace)

        return binToHex(encodeTransactionBch(transaction))

    }

    static getNextBatonUtxo(transactionHex: string): UtxoI {
        let tx_id = swapEndianness(binToHex(hash256(hexToBin(transactionHex))))
        let tx = decodeTransactionBch(hexToBin(transactionHex))
        if (typeof tx == "string") throw tx
        return {
            tx_pos: 0,
            tx_hash: tx_id,
            height: -1,
            value: Number(tx.outputs[0]!.valueSatoshis),
            token_data: {
                nft: {
                    commitment: binToHex(tx.outputs[0]?.token?.nft?.commitment!),
                    capability: 'mutable'
                },
                amount: String(tx.outputs[0]?.token?.amount!),
                category: binToHex(tx.outputs[0]?.token?.category!)
            }

        }

    }

}


/**
     * Get transaction template for mining photons.
     *
     * @param minerThrowawayKey - A private key used for signing the nonce message.
     * @param rewardAddress - The P2PKH Cashaddress to receive payouts.
     * @param category - The token category of the photons being mined.
     * @param fee - transaction fee to pay (per byte); default 1 sat/byte.
     *
     * @throws {Error} if transaction generation fails.
     * @returns a transaction template.
     */

export async function mine(minerThrowawayKey: string, template: string): Promise<string | undefined> {

    const parentPrivateNode = decodeHdPrivateKey(minerThrowawayKey)
    if (typeof parentPrivateNode == "string") throw parentPrivateNode
    let minerNodeChild = deriveHdPrivateNodeChild(parentPrivateNode.node, 0)
    const privateKeyChild = minerNodeChild.privateKey
    const publicNode = deriveHdPublicNode(parentPrivateNode.node)
    const publicKey = deriveHdPublicNodeChild(publicNode, 0)
    const templateBin = hexToBin(template)

    // The index of return baton can change of the sequence (relative age) 
    // pushed has a different length
    //
    let BATON_START = template.indexOf("716400000000")
    if (BATON_START == -1) throw Error("could not locate baton in template")
    BATON_START = (BATON_START / 2) + 2
    templateBin.set(publicKey.publicKey, 45)


    const nextTarget = templateBin.slice(BATON_START + 4, BATON_START + 4 + 32)

    const msg = Uint8Array.from(
        [
            ...numberToBinUint32LE(0),
            ...nextTarget
        ]
    )

    // calculate an updated transaction
    for (let nonce = 0; nonce < Number.MAX_SAFE_INTEGER; nonce++) {
        const nonceBin = numberToBinUint32LE(nonce)

        msg.set(nonceBin, 0)
        const msg_hash = sha256.hash(msg)
        const dataSig = secp256k1.signMessageHashSchnorr(privateKeyChild, msg_hash)
        if (typeof dataSig == "string") throw dataSig
        templateBin.set(nonceBin, BATON_START)
        templateBin.set(dataSig, BATON_START + 36)
        if (nonce % 10000 == 0) console.log(binToHex(hash256(templateBin).slice(-8)), nonce)
        if (binToBigIntUintLE(hash256(templateBin).slice(-32)) < binToBigIntUintLE(nextTarget.slice(-32))) {
            return (binToHex(templateBin))
        }
    }
    return
}
