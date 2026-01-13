import template from './template.v3.json' with { type: "json" };
import packageInfo from '../package.json' with { type: "json" };

import {
    bigIntToVmNumber,
    CompilerBch,
    createVirtualMachineBch,
    deriveHdPublicKey,
    generateTransaction,
    hexToBin,
    InputTemplate,
    OutputTemplate,
    Output,
    Transaction,
    verifyTransactionTokens
} from '@bitauth/libauth';

import {
    getAddress,
    type CashAddressNetworkPrefix,
    getLibauthCompiler,
    getScriptHash,
    UtxoI,
    sumSourceOutputValue,
    sumSourceOutputTokenAmounts
} from '@unspent/tau';

export const BTOP = hexToBin('7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c')
export const tBTOP = hexToBin('ffc9d3b3488e890ef113b1c74f40e1f5eb1147a7d4191cecac89fd515721a271')


export default class BlockTop {

    static USER_AGENT = packageInfo.name;

    static tokenAware = true;

    static template = template;

    static compiler: CompilerBch = getLibauthCompiler(this.template);

    static vm = createVirtualMachineBch();

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

    static getInput(utxo: UtxoI, age: number): InputTemplate<CompilerBch> {

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

    static getOutput(utxo: UtxoI, amount: number, age: number): OutputTemplate<CompilerBch> {

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
            valueSatoshis: 800n,
            token: {
                category: hexToBin(utxo.token_data!.category!),
                amount: BigInt(utxo.token_data?.amount!) - BigInt(amount),
                nft: {
                    capability: "mutable",
                    commitment: hexToBin(utxo.token_data?.nft?.commitment!)
                }
            }
        }

    }

    static getRewardOutput(amount: number, privateKey?: any, addressIndex = 0, category = BTOP): OutputTemplate<CompilerBch> {

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
            valueSatoshis: 800n,
            token: {
                category: category,
                amount: BigInt(amount)
            }
        }

    }


    /**
     * Claim some Block Tops.
     *
     * @param now - The current bitcoin block height timestamp (expressed in blocks).
     * @param contractUtxo - contract outputs to use as input.
     * @param walletUtxos - wallet outputs to use as input.
     * @param key - private key to sign transaction wallet inputs.
     * @param fee - transaction fee to pay (per byte); default 1 sat/byte.
     *
     * @throws {Error} if transaction generation fails.
     * @returns a transaction template.
     */

    static claim(
        now: number,
        contractUtxo: UtxoI,
        key?: string,
        category?: string,
        fee = 1
    ): {
        transaction: Transaction,
        sourceOutputs: Output[],
        verify: string | boolean
    } {

        const inputs: InputTemplate<CompilerBch>[] = [];
        const outputs: OutputTemplate<CompilerBch>[] = [];

        let btopCat = category ? hexToBin(category) : BTOP

        const youngerUtxo =  contractUtxo.height

        const age = now - youngerUtxo;
        const amount = Math.floor(contractUtxo.value / 420768)

        let config = {
            locktime: 0,
            version: 2,
            inputs,
            outputs
        }

        config.inputs.push(this.getInput(contractUtxo, age));
        config.outputs.push(this.getOutput(contractUtxo, amount, age));
        config.outputs.push(this.getRewardOutput(amount, key, 0, btopCat));


        let result = generateTransaction(config);
        
        if (!result.success) throw new Error('generate transaction failed!, errors: ' + JSON.stringify(result.errors, null, '  '));
        
        //const estimatedFee = getTransactionFees(result.transaction, fee)

        // subtract fees off the change output
        // config.outputs[2]!.valueSatoshis = config.outputs[2]!.valueSatoshis - estimatedFee

        result = generateTransaction(config);
        if (!result.success) throw new Error('generate transaction failed!, errors: ' + JSON.stringify(result.errors, null, '  '));


        const sourceOutputs = [ this.getSourceOutput(contractUtxo) ];

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

        let feeEstimate = sumSourceOutputValue(sourceOutputs) - sumSourceOutputValue(transaction.outputs)
        if (feeEstimate > 5000) verify = `Excessive fees ${feeEstimate}`
        if (sumSourceOutputTokenAmounts(sourceOutputs, category) == 0n) verify = `Error checking token input`
        let tokenDiff = sumSourceOutputTokenAmounts(sourceOutputs, category) -
            sumSourceOutputTokenAmounts(transaction.outputs, category)
        if (tokenDiff !== 0n) throw Error(`Claiming should not create destroy tokens, token difference: ${tokenDiff}`)
        return {
            sourceOutputs: sourceOutputs,
            transaction: transaction,
            verify: verify
        }

    }

}