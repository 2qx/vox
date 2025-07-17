import template from './template.json' with { type: "json" };

import {
    bigIntToVmNumber,
    binToHex,
    CompilerBCH,
    createVirtualMachineBCH,
    deriveHdPublicKey,
    encodeTransactionBCH,
    generateTransaction,
    hdPrivateKeyToP2pkhLockingBytecode,
    hexToBin,
    InputTemplate,
    OutputTemplate,
    Output,
    stringify,
    verifyTransactionTokens
} from '@bitauth/libauth';

import {
    getTransactionFees,
    getAddress,
    type CashAddressNetworkPrefix,
    getLibauthCompiler,
    getScriptHash,
    UtxoI,
    sumTokenAmounts,
} from '@unspent/tau';

const BPT = hexToBin('7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c')


export default class BlockPoint {

    static tokenAware = true;

    static template = template;

    static compiler: CompilerBCH = getLibauthCompiler(this.template);

    static vm = createVirtualMachineBCH();

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
            token: {
                category: hexToBin(utxo.token_data!.category!),
                amount: BigInt(utxo.token_data?.amount!)
            }
        }

    }

    static getInput(utxo: UtxoI, age: number): InputTemplate<CompilerBCH> {
        return {
            outpointIndex: utxo.tx_pos,
            outpointTransactionHash: hexToBin(utxo.tx_hash),
            sequenceNumber: age,
            unlockingBytecode: {
                data: {
                    "bytecode": {
                        "age": bigIntToVmNumber(BigInt(age))
                    }
                },
                compiler: this.compiler,
                script: 'unlock',
                valueSatoshis: BigInt(utxo.value),
            },
        } as InputTemplate<CompilerBCH>
    }

    static getOutput(utxo: UtxoI, amount: number, age: number): OutputTemplate<CompilerBCH> {

        return {
            lockingBytecode: {
                data: {
                    "bytecode": {
                        "age": bigIntToVmNumber(BigInt(age))
                    }
                },
                compiler: this.compiler,
                script: 'lock'
            },
            valueSatoshis: BigInt(utxo.value),
            token: {
                category: hexToBin(utxo.token_data!.category!),
                amount: BigInt(utxo.token_data?.amount!) - BigInt(amount)

            }
        }

    }

    static getWalletSourceOutput(utxo: UtxoI, key?: string): Output {

        const lockingBytecode = key ? hdPrivateKeyToP2pkhLockingBytecode({
            addressIndex: 0,
            hdPrivateKey: key
        }) : Uint8Array.from(Array(33))

        return {
            lockingBytecode: lockingBytecode,
            valueSatoshis: BigInt(utxo.value),
            token: utxo.token_data ? {
                category: hexToBin(utxo.token_data!.category!),
                amount: BigInt(utxo.token_data?.amount!)
            } : undefined
        }

    }


    static getWalletInput(utxo: UtxoI, age: number, privateKey?: string, addressIndex = 0): InputTemplate<CompilerBCH> {
        const unlockingData = privateKey ? {
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
            sequenceNumber: age,
            unlockingBytecode: unlockingData,
        } as InputTemplate<CompilerBCH>
    }

    static getChangeOutput(utxo: UtxoI, amount: number, privateKey?: any, addressIndex = 0, category = BPT): OutputTemplate<CompilerBCH> {


        const btps = sumTokenAmounts([utxo], binToHex(category))
        
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
            valueSatoshis: BigInt(utxo.value),
            token: {
                category: category,
                amount: BigInt(btps) + BigInt(amount)
            }
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
        contractUtxo: UtxoI,
        walletUtxo: UtxoI,
        key?: string
    ): Output[] {
        const sourceOutputs: Output[] = [];
        sourceOutputs.push(this.getWalletSourceOutput(walletUtxo, key));
        sourceOutputs.push(this.getSourceOutput(contractUtxo));
        return sourceOutputs
    }

    /**
     * Claim some blockpoints.
     *
     * @param age - The current bitcoin timestamp (expressed in blocks).
     * @param contractUtxo - contract outputs to use as input.
     * @param walletUtxos - wallet outputs to use as input.
     * @param key - private key to sign transaction wallet inputs.
     * @param fee - transaction fee to pay (per byte); default 1 sat/byte.
     *
     * @throws {Error} if transaction generation fails.
     * @returns a transaction template.
     */

    static claim(
        age: number,
        contractUtxo: UtxoI,
        walletUtxo: UtxoI,
        key?: string,
        category?: string,
        fee = 1
    ): string {

        const inputs: InputTemplate<CompilerBCH>[] = [];
        const outputs: OutputTemplate<CompilerBCH>[] = [];

        let bptCat = category ? hexToBin(category) : BPT

        const amount = Math.floor(age * walletUtxo.value / 100000000)

        let config = {

            locktime: 0,
            version: 2,
            inputs,
            outputs
        }
        config.inputs.push(this.getWalletInput(walletUtxo, age, key));
        config.inputs.push(this.getInput(contractUtxo, age));

        config.outputs.push(this.getChangeOutput(walletUtxo, amount, key, 0, bptCat));
        config.outputs.push(this.getOutput(contractUtxo, amount, age));

        let result = generateTransaction(config);
        if (!result.success) throw new Error('generate transaction failed!, errors: ' + JSON.stringify(result.errors, null, '  '));

        const estimatedFee = getTransactionFees(result.transaction, fee)
        config.outputs[0]!.valueSatoshis = config.outputs[0]!.valueSatoshis - estimatedFee

        result = generateTransaction(config);
        if (!result.success) throw new Error('generate transaction failed!, errors: ' + JSON.stringify(result.errors, null, '  '));

        const transaction = result.transaction

        const sourceOutputs = this.getSourceOutputs(contractUtxo, walletUtxo, key);

        const tokenValidationResult = verifyTransactionTokens(
            transaction,
            sourceOutputs
        );
        if (tokenValidationResult !== true && fee > 0) throw tokenValidationResult;

        let verify = this.vm.verify({
            sourceOutputs: sourceOutputs,
            transaction: transaction,
        })

        if (typeof verify == "string") throw verify
        return binToHex(encodeTransactionBCH(transaction))
    }

}