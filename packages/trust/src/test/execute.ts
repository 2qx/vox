import test from 'ava';

import { binToHex, encodeTransactionBch, publicKeyToP2pkhLockingBytecode } from "@bitauth/libauth";

// @ts-ignore
import getAnAliceWallet from "../../../../scripts/aliceWallet.js";
import { Wallet, RegTestWallet, mine, NFTCapability, TokenMintRequest, TokenSendRequest } from "mainnet-js";
import { sleep, UtxoI, getHdPrivateKey } from "@unspent/tau";
import Trust from "../index.js";


test('test executing some trusts', async t => {

    const alice = await getAnAliceWallet(64_000_000)
    let provider = alice.provider!


    let alice_pkh = alice.getPublicKeyHash(false) as Uint8Array
    let alice_lockingBytecode = publicKeyToP2pkhLockingBytecode( {publicKey: alice.publicKey, throwErrors:false}) as Uint8Array

    // Make a "main" badger token.

    let data = {
        "recipient": binToHex(alice_lockingBytecode)
    }

    let recordCommitment = Trust.encodeCommitment(data)

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

    let contract_address = Trust.getAddress(data, "bchreg");

    const ftToken2 = await alice.send(
        [
            {
                cashaddr: contract_address,
                value: 10_000_000,
                unit: 'sat'
            },
            {
                cashaddr: contract_address,
                value: 10_000_001,
                unit: 'sat'
            },
            {
                cashaddr: contract_address,
                value: 10_000_005,
                unit: 'sat'
            },
            {
                cashaddr: contract_address,
                value: 10_000_060,
                unit: 'sat'
            },
            {
                cashaddr: contract_address,
                value: 10_000_900,
                unit: 'sat'
            },
            {
                cashaddr: contract_address,
                value: 10_000_500,
                unit: 'sat'
            }
        ]
    );

    await sleep(1000)

    await mine({
        /* cspell:disable-next-line */
        cashaddr: "bchreg:ppt0dzpt8xmt9h2apv9r60cydmy9k0jkfg4atpnp2f",
        blocks: 4385,
    });

    await sleep(5000)

    // @ts-ignore
    let trustUtxos = await provider.performRequest(
        "blockchain.address.listunspent",
        contract_address,
        "include_tokens"
    )
    let jobs = trustUtxos.map((u: UtxoI) => { return { record: record, utxo: u } })


    let height = await provider.getBlockHeight()

    await sleep(3000)
    t.assert(height - trustUtxos[0]!.height >= 4383)

    let bob = await RegTestWallet.newRandom();
    await sleep(1000);
    let batchTx = Trust.execute(
        jobs,
        height,
        bob.getDepositAddress()
    )

    //@ts-ignore
    let response = await provider.performRequest(
        "blockchain.transaction.broadcast",
        binToHex(encodeTransactionBch(batchTx.transaction))
    )

    t.assert(response.length >= 32)

    t.truthy(batchTx.verify)

    await sleep(1000);
    await sleep(1000);
    let bobBalance = await bob.getBalance("sats") as number
    console.log(bobBalance)
    t.assert(bobBalance > 0)


});
