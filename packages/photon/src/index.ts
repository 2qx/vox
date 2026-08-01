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
    Transaction,
    verifyTransactionTokens,
    encodeTransactionBch,
    secp256k1,
    sha256,
    hash256,
    deriveHdPrivateNodeChild,
    decodeHdPrivateKey,
    cashAddressToLockingBytecode,
    numberToBinUint32LE,
    bigIntToBinUintLE
} from '@bitauth/libauth';

import {
    getAddress,
    type CashAddressNetworkPrefix,
    binToBigIntUint256LE,
    bigIntToBinUint256LE,
    getLibauthCompiler,
    getScriptHash,
    UtxoI,
    sumSourceOutputValue,
    sumSourceOutputTokenAmounts
} from '@unspent/tau';

export const PHOTON_CATEGORY = hexToBin('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
export const tPHOTON_CATEGORY = hexToBin('8bc4c5974bb98a01d08ef9ba1b7208212b66678732519c4881d2fa924c2a159f')


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
        return bigIntToBinUint256LE((prevTarget * (BigInt(age) + 143n))/ 144n)

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

    static getRewardOutput(amount: number, rewardAddress?: any, category = PHOTON_CATEGORY): OutputTemplate<CompilerBch> {

        let lockingBytecode = cashAddressToLockingBytecode(rewardAddress)
        if (typeof lockingBytecode == "string") throw lockingBytecode
        return {
            lockingBytecode: lockingBytecode.bytecode,
            valueSatoshis: 800n,
            token: {
                category: category,
                amount: BigInt(amount)
            }
        }

    }


    /**
     * Mine for photons (slow)
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

    static slowMine(
        now: number,
        contractUtxo: UtxoI,
        minerThrowawayKey: string,
        rewardAddress: string,
        category?: string,
        fee = 1,
        tries = 500
    ): {
        transaction: Transaction,
        sourceOutputs: Output[],
        verify: string | boolean
    } {

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

        let transaction
        let sucessfulNonce = false
        const nextTarget = binToBigIntUint256LE(this.getNextTarget(contractUtxo, now))
        for (var i = 0; i < tries && !sucessfulNonce; i++) {

            config.outputs = [this.getOutput(contractUtxo, rewardAmount, now, minerThrowawayKey, i)];
            config.outputs.push(this.getRewardOutput(rewardAmount, rewardAddress, photonCat));
            let result = generateTransaction(config);
            if (!result.success) throw new Error('generate transaction failed!, errors: ' + JSON.stringify(result.errors, null, '  '));
            if (binToBigIntUint256LE(hash256(encodeTransactionBch(result.transaction))) < nextTarget) {
                console.log("SUCCESS! after ", i, " tries")
                console.log(binToHex(hash256(encodeTransactionBch(result.transaction))))
                sucessfulNonce = true
                transaction = result.transaction
            }
        }

        const sourceOutputs = [this.getSourceOutput(contractUtxo)];

        if (!sucessfulNonce || !transaction) throw (`failed to find a nonce in ${tries}`)

        let state = this.vm.debug({
            inputIndex: 0,
            sourceOutputs,
            transaction,
        })


        //console.log("debug: ",unexpectedFailingIndexDebugTrace)
        //console.log(binToHex(transaction.inputs[0]?.unlockingBytecode!))

        // let trace = stringifyDebugTraceSummary(
        //     summarizeDebugTrace(state.slice(-9)),
        // )
        // console.log(trace)

        encodeTransactionBch(transaction)
        const tokenValidationResult = verifyTransactionTokens(
            transaction,
            sourceOutputs,
            { maximumTokenCommitmentLength: 128 }
        );
        if (tokenValidationResult !== true && fee > 0) throw tokenValidationResult;

        let verify = this.vm.verify({
            sourceOutputs: sourceOutputs,
            transaction: transaction,
        })

        let feeEstimate = sumSourceOutputValue(sourceOutputs) - sumSourceOutputValue(transaction.outputs)
        if (feeEstimate > 5000) verify = `Excessive fees ${feeEstimate}`
        if (sumSourceOutputTokenAmounts(sourceOutputs, category) == 0n) verify = `Error checking token input`
        let tokenDiff = sumSourceOutputTokenAmounts(sourceOutputs, category) -
            sumSourceOutputTokenAmounts(transaction.outputs, category)
        if (tokenDiff !== 0n) throw Error(`Claiming should not create or destroy tokens, token difference: ${tokenDiff}`)
        return {
            sourceOutputs: sourceOutputs,
            transaction: transaction,
            verify: verify
        }

    }

}