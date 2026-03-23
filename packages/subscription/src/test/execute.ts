import test from 'ava';

import { binToHex, encodeTransactionBch, hexToBin, publicKeyToP2pkhLockingBytecode } from "@bitauth/libauth";

// @ts-ignore
import getAnAliceWallet from "../../../../scripts/aliceWallet.js";
import { Wallet, RegTestWallet, mine, NFTCapability, TokenMintRequest, TokenSendRequest } from "mainnet-js";
import { sleep, UtxoI, getHdPrivateKey } from "@unspent/tau";
import Subscription from "../index.js";


test('test executing some subscriptions', async t => {

    const alice = await getAnAliceWallet(2400000000)
    let provider = alice.provider!


    const charlie = await RegTestWallet.newRandom()
    
    let charlie_lockingBytecode = publicKeyToP2pkhLockingBytecode( {publicKey: charlie.publicKey, throwErrors:false}) as Uint8Array

    const aliceAuthResponse = await alice.tokenGenesis({
        capability: NFTCapability.minting,
        commitment: "anything goes",
        value: 800,                    // Satoshi value
    });

    const tokenId = aliceAuthResponse.tokenIds![0]!;

    let data = {
        period: 0,
        recipient: charlie_lockingBytecode,
        installment: 100000n,
        auth: hexToBin(tokenId)
    }

    let recordCommitment = Subscription.encodeCommitment(data)


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

    let contract_address = Subscription.getAddress(data, "bchreg");

    await alice.sendMax(alice.getDepositAddress())

    const ftToken1 = await alice.tokenGenesis({
        cashaddr: contract_address,
        amount: 100_000_000n,
        value: 500_000,                    // Satoshi value
    });

    // await alice.sendMax(alice.getDepositAddress())
    // const ftToken2 = await alice.tokenGenesis({
    //     cashaddr: contract_address,
    //     amount: 100_000_000n,
    //     value: 500_000,                    // Satoshi value
    // });
    
    await sleep(1000)

    await mine({
        /* cspell:disable-next-line */
        cashaddr: "bchreg:ppt0dzpt8xmt9h2apv9r60cydmy9k0jkfg4atpnp2f",
        blocks: 3,
    });

    await sleep(3000)
    
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
    let tx = Subscription.execute(
        jobs,
        height,
        //bob.getDepositAddress()
    )

    let input0 = tx.sourceOutputs[0]
    let output0 = tx.transaction.outputs[0]
    let output1 = tx.transaction.outputs[1]
    
    t.assert(tx.transaction.version == 2, "transaction version is two");

    t.assert(tx.transaction.inputs[0]!.sequenceNumber > data.period, "min input age")
    // t.assert(tx.transaction.inputs[1]!.sequenceNumber > data.period, "min input age")
    
    // Check installment output
    t.deepEqual(input0?.token?.category, output0?.token?.category, "input0 auth cat matches")
    // t.deepEqual(input1?.token?.category, output1?.token?.category, "input1 auth cat matches")

    t.deepEqual(output0?.lockingBytecode, data.recipient, "output lockingBytecode pays recipient")
    // t.deepEqual(output1?.lockingBytecode, hexToBin(data.recipient), "output lockingBytecode pays recipient")

    t.assert(output0?.valueSatoshis == 800n, "min sats out")
    // t.assert(output1?.valueSatoshis == 800n, "min sats out")

    t.assert(output0?.token?.amount == data.installment, "output0 auth cat matches")
    // t.assert(output1?.token?.amount == data.installment, "output1 auth cat matches")
    
    // Check return output
    t.assert(output1?.valueSatoshis! == input0!.valueSatoshis - 5000n, "min sats out")
    // t.assert(output3?.valueSatoshis! >= input1!.valueSatoshis - 5000n, "min sats out")

    t.assert(output1!.token!.amount == input0!.token!.amount! - data.installment, "output2 token return meet minimum")
    // t.assert(output3!.token!.amount == input1!.token!.amount! - data.installment, "output3 token return meet minimum")

    t.deepEqual(input0?.token?.category, output1?.token?.category, "output2 auth cat matches")
    // t.deepEqual(input1?.token?.category, output3?.token?.category, "output3 auth cat matches")

    // t.deepEqual(input0?.lockingBytecode, output2?.lockingBytecode, "output2 lockingBytecode continues")
    // t.deepEqual(input1?.lockingBytecode, output3?.lockingBytecode, "output3 lockingBytecode continues")

    console.log("here")
    await sleep(100)
    
    console.log(tx.verify)
    await sleep(1000);


    console.log(binToHex(encodeTransactionBch(tx.transaction)))
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
