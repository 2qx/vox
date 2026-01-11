import template from './template.v1.json' with { type: "json" };
import packageInfo from '../package.json' with { type: "json" };

import {
    binToHex,
    bigIntToVmNumber,
    binToNumberInt16LE,
    CompilerBch,
    createVirtualMachineBch,
    deriveHdPublicKey,
    generateTransaction,
    hdPrivateKeyToP2pkhLockingBytecode,
    encodeLockingBytecodeP2pkh,
    hexToBin,
    InputTemplate,
    OutputTemplate,
    Output,
    padMinimallyEncodedVmNumber,
    Transaction,
    verifyTransactionTokens,
    numberToBinInt16LE,
    stringify,
    lockingBytecodeToAddressContents,
    encodeTransactionBch,
    NonFungibleTokenCapability
} from '@bitauth/libauth';

import {
    getAddress,
    type CashAddressNetworkPrefix,
    getLibauthCompiler,
    getScriptHash,
    getTransactionFees,
    sumSourceOutputValue,
    sumSourceOutputTokenAmounts,
    sumOutputValue,
    UtxoI,
} from '@unspent/tau';

export const BADGER = hexToBin('242f6ecedb404c743477e35b09733a56cacae34f3109d5cee1cbc1d5630affd7')
export const tBADGER = hexToBin('7003b9e854d2abc855b2c20c9734c3dfe4ec3a4de573f7ebb9ce1be527a5bb36')


export interface StakeRequest {
    user_pkh: Uint8Array;
    amount: number;
    stake: number;
}

export interface StakeSettings {
    admin_pkh: Uint8Array;
    amount: number;
    fee: number;
}


export default class BadgerStake {

    static USER_AGENT = packageInfo.name;

    static tokenAware = true;

    static template = template;

    static compiler: CompilerBch = getLibauthCompiler(this.template);

    static vm = createVirtualMachineBch();

    static getLockingBytecode(category: string | Uint8Array = BADGER): Uint8Array {

        if (typeof category == "string") category = hexToBin(category)

        const lockingBytecodeResult = this.compiler.generateBytecode(
            {
                data: {
                    "bytecode": {
                        "authentication_category": new Uint8Array(category).reverse()
                    }
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
     * @param category - the category for badger tokens.
     * @param reversed - whether to reverse the hash.
     * @throws {Error} if transaction generation fails.
     * @returns a cashaddress.
     */
    static getScriptHash(category: string | Uint8Array, reversed = true): string {
        return getScriptHash(this.getLockingBytecode(category), reversed)
    }

    /**
     * Get cashaddress
     *
     * @param category - the category for badger tokens.
     * @param prefix - cashaddress prefix.
     * @throws {Error} if transaction generation fails.
     * @returns a cashaddress.
     */
    static getAddress(
        category: string | Uint8Array = BADGER,
        prefix = "bitcoincash" as CashAddressNetworkPrefix
    ): string {

        return getAddress(this.getLockingBytecode(category), prefix, this.tokenAware)

    }

    static parseNFT(utxo: UtxoI): StakeRequest | StakeSettings {

        if (utxo.token_data?.nft?.capability == "mutable") {
            return {
                user_pkh: hexToBin(utxo.token_data?.nft?.commitment.slice(0, 40)),
                stake: binToNumberInt16LE(hexToBin(utxo.token_data?.nft?.commitment.slice(-4)!)),
                amount: parseInt(utxo.token_data?.amount!)
            } as StakeRequest
        } else if (utxo.token_data?.nft?.capability == "minting") {
            return {
                admin_pkh: hexToBin(utxo.token_data?.nft?.commitment.slice(-40)),
                fee: binToNumberInt16LE(hexToBin(utxo.token_data?.nft?.commitment.slice(0, 4)!)),
                amount: parseInt(utxo.token_data?.amount!)
            } as StakeSettings
        } else {
            throw Error("Nft was not minting nor mutable")
        }

    }


    /**
     * Encode an order on for an nft commitment
     *
     * @param commitment - nft commitment
     * @returns the new commitment as a 40-byte stake data.
     */
    static encodeNFT(stake: StakeRequest | StakeSettings): Uint8Array {
        if ((<StakeRequest>stake).user_pkh !== undefined) {
            stake = stake as StakeRequest
            return new Uint8Array(
                [
                    ...stake.user_pkh,
                    ... new Uint8Array(18),
                    ...numberToBinInt16LE(stake.stake)
                ]
            )
        }
        else {
            stake = stake as StakeSettings
            return new Uint8Array(
                [
                    ...numberToBinInt16LE(stake.fee),
                    ... new Uint8Array(18),
                    ...stake.admin_pkh
                ]
            )
        }
    }


    static encodeCommemorativeNFT(amount: bigint): Uint8Array {
        return new Uint8Array(
            [
                ... new Uint8Array(2),
                ...bigIntToVmNumber(amount)
            ]
        )
    }

    static getSourceOutput(utxo: UtxoI): Output {

        return {
            lockingBytecode: this.getLockingBytecode(utxo.token_data?.category!),
            valueSatoshis: BigInt(utxo.value),
            token: utxo.token_data ? {
                category: hexToBin(utxo.token_data!.category!),
                amount: BigInt(utxo.token_data!.amount),
                nft: utxo.token_data.nft ? {
                    commitment: hexToBin(utxo.token_data.nft.commitment!),
                    capability: utxo.token_data.nft.capability,
                } : undefined
            } : undefined
        }

    }

    static getAuthInput(utxo: UtxoI, req: StakeRequest): InputTemplate<CompilerBch> {

        let authCat = new Uint8Array(hexToBin(utxo.token_data?.category!)).reverse()

        return {
            outpointIndex: utxo.tx_pos,
            outpointTransactionHash: hexToBin(utxo.tx_hash),
            sequenceNumber: 0,
            unlockingBytecode: {
                data: {
                    "bytecode": {
                        "authentication_category": authCat,
                        "amount": bigIntToVmNumber(BigInt(Math.floor(req.amount))),
                        "stake_blocks": bigIntToVmNumber(BigInt(req.stake)),
                        "user_pkh": req.user_pkh
                    }
                },
                compiler: this.compiler,
                script: 'stake',
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

    static getAuthOutput(utxo: UtxoI, value: number, stake: number, fee: number): OutputTemplate<CompilerBch> {

        return {
            lockingBytecode: this.getLockingBytecode(utxo.token_data?.category!),
            valueSatoshis: BigInt(utxo.value + fee),
            token: utxo.token_data ? {
                category: hexToBin(utxo.token_data!.category!),
                amount: BigInt(utxo.token_data.amount) - BigInt(Math.floor(value / 100_000_000 * stake)),
                nft: utxo.token_data.nft ? {
                    commitment: hexToBin(utxo.token_data.nft.commitment!),
                    capability: utxo.token_data.nft.capability,
                } : undefined
            } : undefined
        }
    }

    static getWalletSourceOutput(utxo: UtxoI, key?: string, addressIndex = 0): Output {

        const lockingBytecode = key ? hdPrivateKeyToP2pkhLockingBytecode({
            addressIndex: addressIndex,
            hdPrivateKey: key,
            throwErrors: true
        }) : Uint8Array.from(Array(33))

        return {
            lockingBytecode: lockingBytecode,
            valueSatoshis: BigInt(utxo.value)
        }

    }


    static getWalletInput(utxo: UtxoI, privateKey?: string, addressIndex = 0): InputTemplate<CompilerBch> {

        let unlockingData = privateKey ? {
            compiler: this.compiler,
            data: {
                hdKeys: {
                    addressIndex: addressIndex,
                    hdPrivateKeys: {
                        'wallet': privateKey
                    },
                }
            },
            script: 'wallet_unlock',
            valueSatoshis: BigInt(utxo.value)
        } : Uint8Array.from(Array())

        return {
            outpointIndex: utxo.tx_pos,
            outpointTransactionHash: hexToBin(utxo.tx_hash),
            sequenceNumber: 0,
            unlockingBytecode: unlockingData,
        } as InputTemplate<CompilerBch>
    }

    // 
    static getUnlockInput(utxo: UtxoI): InputTemplate<CompilerBch> {

        let req = this.parseNFT(utxo) as StakeRequest

        return {
            outpointIndex: utxo.tx_pos,
            outpointTransactionHash: hexToBin(utxo.tx_hash),
            sequenceNumber: req.stake,
            unlockingBytecode: {
                data: {
                    "bytecode": {
                        "authentication_category": new Uint8Array(hexToBin(utxo.token_data!.category!)).reverse()
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



    static getLockOutput(authUtxo: UtxoI, stake: StakeRequest): OutputTemplate<CompilerBch> {

        return {
            lockingBytecode: this.getLockingBytecode(authUtxo.token_data?.category!),
            valueSatoshis: BigInt(stake.amount),
            token: {
                category: hexToBin(authUtxo.token_data?.category!),
                amount: BigInt(Math.floor(stake.amount / 100_000_000 * stake.stake)),
                nft: {
                    commitment: BadgerStake.encodeNFT(stake),
                    capability: 'mutable',
                }
            }
        }

    }

    static getUnlockOutputs(utxo: UtxoI): OutputTemplate<CompilerBch>[] {

        let req = this.parseNFT(utxo) as StakeRequest
        let lockingBytecode = encodeLockingBytecodeP2pkh(req.user_pkh)

        return [
            {
                lockingBytecode: lockingBytecode,
                valueSatoshis: 1000n,
                token: utxo.token_data ? {
                    category: hexToBin(utxo.token_data!.category!),
                    amount: BigInt(utxo.token_data.amount),
                    nft: undefined
                } : undefined
            },
            {
                lockingBytecode: lockingBytecode,
                valueSatoshis: 1000n,
                token: utxo.token_data ? {
                    category: hexToBin(utxo.token_data!.category!),
                    amount: BigInt(0),
                    nft: utxo.token_data.nft ? {
                        commitment: this.encodeCommemorativeNFT(BigInt(utxo.token_data.amount)),
                        capability: NonFungibleTokenCapability.none,
                    } : undefined
                } : undefined
            },
            {
                lockingBytecode: lockingBytecode,
                valueSatoshis: BigInt(utxo.value - 3000)
            }
        ]

    }


    static getWalletInputs(
        utxos: UtxoI[],
        amount: bigint,
        privateKey?: string,
        sourceOutputs: Output[] = []
    ): {
        inputs: InputTemplate<CompilerBch>[],
        outputs: OutputTemplate<CompilerBch>[],
        sourceOutputs: Output[]
    } {

        let inputs: InputTemplate<CompilerBch>[] = [];
        let outputs: OutputTemplate<CompilerBch>[] = [];

        // exclude utxos with tokens
        utxos = utxos.filter(u => !u.token_data && u.value > amount)

        // TODO: sort by highest value first
        if (utxos.length == 0) throw Error("no suitable output is large enough for the stake.");

        // get a random utxo.
        const randomIdx = Math.floor(Math.random() * utxos.length)
        const randomUtxo = utxos[randomIdx]!

        // remove the random utxo in place
        utxos.splice(randomIdx, 1);

        // spend the utxo
        inputs.push(this.getWalletInput(randomUtxo, privateKey))
        sourceOutputs.push(this.getWalletSourceOutput(randomUtxo, privateKey));

        return { inputs, outputs, sourceOutputs }
    }

    static getChangeOutput(
        value: bigint,
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
            valueSatoshis: value
        }
    }

    /**
     * Lock a new BadgerStake.
     *
     * @param main - "MasterBadger utxo.
     *
     * @throws {Error} if transaction generation fails.
     * @returns a transaction template.
     */

    static lock(
        authUtxo: UtxoI,
        value: number,
        stake: number,
        utxos: UtxoI[],
        key?: any,
        addressIndex = 0,
        fee = 1
    ): {
        transaction: Transaction,
        sourceOutputs: Output[],
        verify: string | boolean
    } {

        const inputs: InputTemplate<CompilerBch>[] = [];
        const outputs: OutputTemplate<CompilerBch>[] = [];

        const lockingBytecode = key ? hdPrivateKeyToP2pkhLockingBytecode({
            addressIndex: addressIndex,
            hdPrivateKey: key,
            throwErrors: true
        }) : Uint8Array.from(Array(33))


        let config = {
            locktime: 0,
            version: 2,
            inputs,
            outputs
        }

        let settings = BadgerStake.parseNFT(authUtxo) as StakeSettings

        let stakeRequest = {
            user_pkh: lockingBytecodeToAddressContents(lockingBytecode).payload,
            amount: value,
            stake: stake
        }

        config.inputs.push(this.getAuthInput(authUtxo, stakeRequest));
        config.outputs.push(this.getAuthOutput(authUtxo, value, stake, settings.fee));
        const sourceOutputs = [this.getSourceOutput(authUtxo)];
        config.outputs.push(this.getLockOutput(authUtxo, stakeRequest));


        const fundingConfig = this.getWalletInputs(utxos, BigInt(value), key)

        config.inputs.push(...fundingConfig.inputs);
        sourceOutputs.push(...fundingConfig.sourceOutputs);

        let satsOut = sumOutputValue(config.outputs)
        let satsIn = sumSourceOutputValue(sourceOutputs)
        config.outputs.push(this.getChangeOutput(satsIn - satsOut, key))

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
        if (tokenValidationResult !== true && fee > 0) throw tokenValidationResult;

        let verify = this.vm.verify({
            sourceOutputs: sourceOutputs,
            transaction: transaction,
        })

        let assetCat = authUtxo.token_data?.category
        let feeEstimate = sumSourceOutputValue(sourceOutputs) - sumSourceOutputValue(transaction.outputs)
        if (feeEstimate > 5000) verify = `Excessive fees ${feeEstimate}`
        if (sumSourceOutputTokenAmounts(sourceOutputs, assetCat) == 0n) verify = `Error checking token input`
        let tokenDiff = sumSourceOutputTokenAmounts(sourceOutputs, assetCat) -
            sumSourceOutputTokenAmounts(
                transaction.outputs,
                assetCat
            )
        if (tokenDiff !== 0n) throw Error(`Claiming should not create destroy tokens, token difference: ${tokenDiff}`)

        return {
            sourceOutputs: sourceOutputs,
            transaction: transaction,
            verify: verify
        }


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

        config.inputs.push(this.getUnlockInput(utxo));
        config.outputs.push(... this.getUnlockOutputs(utxo));

        let result = generateTransaction(config);
        if (!result.success) throw new Error('generate transaction failed!, errors: ' + JSON.stringify(result.errors, null, '  '));

        const sourceOutputs = [this.getSourceOutput(utxo)];

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