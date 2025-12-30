import test from 'ava';
import {
    getHdPrivateKey,
    sleep,
    UtxoI
} from "@unspent/tau";
// @ts-ignore
import getAnAliceWallet from "../../../../scripts/aliceWallet.js";
import { RegTestWallet, NFTCapability, SendRequest, TokenSendRequest } from "mainnet-js";

import { binToHex, encodeTransactionBch, stringify } from '@bitauth/libauth';

import CatDex, { OrderRequest } from '../index.js';

test('Should create a new blackboard with sell', async t => {

    const alice = await getAnAliceWallet(500_000)

    await alice.sendMax(alice.getDepositAddress())

    const genesisResponse = await alice.tokenGenesis({
        cashaddr: alice.getTokenDepositAddress(),      // token UTXO recipient, if not specified will default to sender's address
        amount: BigInt(21e14),   // fungible token amount
        value: 1000,                    // Satoshi value
    });
    let assetCat = genesisResponse.tokenIds![0]!

    await alice.sendMax(alice.getDepositAddress())

    const mintingResponse = await alice.tokenGenesis({
        cashaddr: alice.tokenaddr!,        // token UTXO recipient, if not specified will default to sender's address
        commitment: "regtest baton",                // NFT Commitment message
        capability: NFTCapability.minting, // NFT capability
        value: 1000,                       // Satoshi value
    });
    let authCat = mintingResponse.tokenIds![0]!
    //@ts-ignore
    let privateKey = getHdPrivateKey(alice.mnemonic!, alice.derivationPath.slice(0, -2), alice.isTestnet)


    // @ts-ignore
    let walletUtxos = await alice.provider.performRequest(
        "blockchain.address.listunspent",
        alice.getDepositAddress(),
        "include_tokens"
    )

    let authToken = walletUtxos.filter((u: UtxoI) => u.token_data && u.token_data.category == authCat)[0]


    let order: OrderRequest[] = [
        {
            price: 20,
            quantity: 10000n
        }
    ]

    const tx = CatDex.administer(authToken, assetCat, [], order, walletUtxos, privateKey);

    t.assert(encodeTransactionBch(tx.transaction).length > 0, "transaction hex have a non-zero length")
    t.is(tx.verify, true, "transaction if valid")

});

test('Should create a new blackboard with buy', async t => {

    const alice = await getAnAliceWallet(100_100_000)

    await alice.sendMax(alice.getDepositAddress())

    const genesisResponse = await alice.tokenGenesis({
        cashaddr: alice.getTokenDepositAddress(),      // token UTXO recipient, if not specified will default to sender's address
        amount: BigInt(21e14),   // fungible token amount
        value: 1000,                    // Satoshi value
    });
    let assetCat = genesisResponse.tokenIds![0]!

    await alice.sendMax(alice.getDepositAddress())

    const mintingResponse = await alice.tokenGenesis({
        cashaddr: alice.tokenaddr!,        // token UTXO recipient, if not specified will default to sender's address
        commitment: "",                // NFT Commitment message
        capability: NFTCapability.minting, // NFT capability
        value: 1000,                       // Satoshi value
    });
    let authCat = mintingResponse.tokenIds![0]!
    //@ts-ignore
    let privateKey = getHdPrivateKey(alice.mnemonic!, alice.derivationPath.slice(0, -2), alice.isTestnet)

    // @ts-ignore
    let walletUtxos = await alice.provider.performRequest(
        "blockchain.address.listunspent",
        alice.getDepositAddress(),
        "include_tokens"
    )

    let authToken = walletUtxos.filter((u: UtxoI) => u.token_data && u.token_data.category == authCat)[0]

    let order: OrderRequest[] = [
        {
            price: 20,
            quantity: -500000n
        }
    ]

    const tx = CatDex.administer(authToken, assetCat, [], order, walletUtxos, privateKey);
    t.assert(encodeTransactionBch(tx.transaction).length > 0, "transaction hex have a non-zero length")
    t.is(tx.verify, true, "transaction if valid")

    // @ts-ignore
    await alice.provider.performRequest(
        "blockchain.transaction.broadcast",
        binToHex(encodeTransactionBch(tx.transaction))
    )

    // @ts-ignore
    walletUtxos = await alice.provider.performRequest(
        "blockchain.address.listunspent",
        alice.getDepositAddress(),
        "include_tokens"
    )

    authToken = walletUtxos.filter((u: UtxoI) => u.token_data && u.token_data.category == authCat)[0]
    t.is(authToken.value > 0, true, "auth baton survived")

});


test('Should clear a new blackboard with buy & sell', async t => {

    const alice = await getAnAliceWallet(100_100_000)

    await alice.sendMax(alice.getDepositAddress())

    const genesisResponse = await alice.tokenGenesis({
        cashaddr: alice.getTokenDepositAddress(),      // token UTXO recipient, if not specified will default to sender's address
        amount: BigInt(21e14),   // fungible token amount
        value: 1000,                    // Satoshi value
    });
    let assetCat = genesisResponse.tokenIds![0]!

    await alice.sendMax(alice.getDepositAddress())

    const mintingResponse = await alice.tokenGenesis({
        cashaddr: alice.tokenaddr!,        // token UTXO recipient, if not specified will default to sender's address
        commitment: "1234",                // NFT Commitment message
        capability: NFTCapability.minting, // NFT capability
        value: 1000,                       // Satoshi value
    });
    let authCat = mintingResponse.tokenIds![0]!

    //@ts-ignore
    //let privateKey = process.env["PRIVATE_KEY"]!

    let key = getHdPrivateKey(alice.mnemonic!, alice.derivationPath.slice(0, -2), alice.isTestnet)

    // @ts-ignore
    let walletUtxos = await alice.provider.performRequest(
        "blockchain.address.listunspent",
        alice.getDepositAddress(),
        "include_tokens"
    )

    let authToken = walletUtxos.filter((u: UtxoI) => u.token_data && u.token_data.category == authCat)[0]
    let orders: OrderRequest[] = [
        {
            price: 20,
            quantity: -500000n
        },
        {
            price: 20,
            quantity: 100000n
        }
    ]

    const tx = CatDex.administer(authToken, assetCat, [], orders, walletUtxos, key);

    t.assert(encodeTransactionBch(tx.transaction).length > 0, "transaction hex have a non-zero length")
    t.is(tx.verify, true, "transaction if valid")

    t.is(
        binToHex(tx.sourceOutputs[0]?.token?.category!),
        authCat,
        "auth token should match"
    )
    t.is(
        binToHex(tx.transaction.outputs[1]!.lockingBytecode!),
        binToHex(CatDex.getLockingBytecode(authCat, assetCat)),
        "Dex locking bytecode should match"
    )

    // @ts-ignore
    let response = await alice.provider.performRequest(
        "blockchain.transaction.broadcast",
        binToHex(encodeTransactionBch(tx.transaction))
    )

    await sleep(2000)
    // @ts-ignore
    let dexUtxos = await alice.provider.performRequest(
        "blockchain.scripthash.listunspent",
        CatDex.getScriptHash(authCat, assetCat),
        "include_tokens"
    )


    t.assert(dexUtxos.length > 0, "Dex should have unspent outputs")

    // @ts-ignore
    walletUtxos = await alice.provider.performRequest(
        "blockchain.address.listunspent",
        alice.getDepositAddress(),
        "include_tokens"
    )
    authToken = walletUtxos.filter((u: UtxoI) => u.token_data && u.token_data.category == authCat)[0]


    const tx2 = CatDex.administer(authToken, assetCat, dexUtxos, [], walletUtxos, key);

    t.assert(encodeTransactionBch(tx2.transaction).length > 0, "transaction hex have a non-zero length")


    // @ts-ignore
    response = await alice.provider.performRequest(
        "blockchain.transaction.broadcast",
        binToHex(encodeTransactionBch(tx2.transaction))
    )
    t.assert(response.length == 64)


});