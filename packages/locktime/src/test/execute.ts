import test from 'ava';

import { binToHex, encodeTransactionBch, publicKeyToP2pkhLockingBytecode } from "@bitauth/libauth";

// @ts-ignore
import getAnAliceWallet from "../../../../scripts/aliceWallet.js";
import { Wallet, RegTestWallet, mine, NFTCapability, TokenMintRequest, TokenSendRequest } from "mainnet-js";
import { sleep, UtxoI, getHdPrivateKey } from "@unspent/tau";
import Locktime from "../index.js";


test('test executing some locktime contracts', async t => {

    const alice = await getAnAliceWallet(2400000000)
    let provider = alice.provider!


    
    let alice_lockingBytecode = publicKeyToP2pkhLockingBytecode( {publicKey: alice.publicKey, throwErrors:false}) as Uint8Array
    // Make a "main" badger token.

    const aliceAuthResponse = await alice.tokenGenesis({
        capability: NFTCapability.minting,
        commitment: "anything goes",
        value: 800,                    // Satoshi value
    });
    const tokenId = aliceAuthResponse.tokenIds![0]!;

    let data = {
        locktime: 10,
        recipient: binToHex(alice_lockingBytecode)
    }

    let recordCommitment = Locktime.encodeCommitment(data)


    let record = {
        height: 100,
        tx_hash: "deaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddead",
        tx_pos: 1,
        token_data: {
            category: "deaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddead",
            nft: {
                commitment: recordCommitment,
                capability: "none"
            },
            amount: "0"
        },
        value: 800
    } as UtxoI

    let contract_address = Locktime.getAddress(data, "bchreg");



    await alice.sendMax(alice.getDepositAddress())

    const ftToken1 = await alice.tokenGenesis({
        cashaddr: contract_address,
        amount: 100_000_000n,
        value: 500_000,                    // Satoshi value
    });

    await alice.sendMax(alice.getDepositAddress())
    const ftToken2 = await alice.tokenGenesis({
        cashaddr: contract_address,
        amount: 100_000_000n,
        value: 500_000,                    // Satoshi value
    });

    await alice.send({
        cashaddr: contract_address,
        value: 10000,
        unit: 'sats'
    })

    await sleep(1000)


    // @ts-ignore
    let subscriptionUtxos = await provider.performRequest(
        "blockchain.address.listunspent",
        contract_address,
        "include_tokens"
    )
    let jobs = subscriptionUtxos.map((u: UtxoI) => { return { record: record, utxo: u } })



    // @ts-ignore
    let utxos = await provider.performRequest(
        "blockchain.address.listunspent",
        alice.getTokenDepositAddress(),
        "exclude_tokens"
    )

    let height = await provider.getBlockHeight()
    let bob = await RegTestWallet.newRandom();
    await sleep(1000);
    let tx = Locktime.execute(
        jobs,
        height,
        bob.getDepositAddress()
    )

    // let input0 = tx.sourceOutputs[0]
    // let input1 = tx.sourceOutputs[1]
    // let output0 = tx.transaction.outputs[0]
    // let output1 = tx.transaction.outputs[1]

    t.assert(tx.transaction.version == 2, "transaction version is two");


    // // Check installment output
    // t.deepEqual(input0?.token?.category, output0?.token?.category, "input0 auth cat matches")
    // t.deepEqual(input1?.token?.category, output1?.token?.category, "input1 auth cat matches")
    // t.deepEqual(output0?.lockingBytecode, hexToBin(data.recipient), "output lockingBytecode pays recipient")
    // t.deepEqual(output1?.lockingBytecode, hexToBin(data.recipient), "output lockingBytecode pays recipient")

    // t.assert(output0?.valueSatoshis == 800n, "min sats out")
    // t.assert(output1?.valueSatoshis == 800n, "min sats out")
    // t.assert(output0?.token?.amount == data.installment, "output0 auth cat matches")
    // t.assert(output1?.token?.amount == data.installment, "output1 auth cat matches")

    // // Check return outputs
    // t.assert(output2?.valueSatoshis! >= input0!.valueSatoshis - 5000n, "min sats out")
    // t.assert(output3?.valueSatoshis! >= input1!.valueSatoshis - 5000n, "min sats out")
    // t.assert(output2!.token!.amount == input0!.token!.amount! - data.installment, "output2 token return meet minimum")
    // t.assert(output3!.token!.amount == input1!.token!.amount! - data.installment, "output3 token return meet minimum")
    // t.deepEqual(input0?.token?.category, output2?.token?.category, "output2 auth cat matches")
    // t.deepEqual(input1?.token?.category, output3?.token?.category, "output3 auth cat matches")
    // t.deepEqual(input0?.lockingBytecode, output2?.lockingBytecode, "output2 lockingBytecode continues")
    // t.deepEqual(input1?.lockingBytecode, output3?.lockingBytecode, "output3 lockingBytecode continues")

    await sleep(100)
    // @ts-ignore
    let response = await provider.performRequest(
        "blockchain.transaction.broadcast",
        binToHex(encodeTransactionBch(tx.transaction))
    )

    t.assert(response.length >= 32)

    t.truthy(tx.verify)

    await sleep(1000);

    let bobBalance = await bob.getBalance("sats") as number
    t.assert(bobBalance > 0)


});
