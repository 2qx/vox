import test from 'ava';
import {
    getHdPrivateKey,
    sleep,
    UtxoI
} from "@unspent/tau";
// @ts-ignore
import getAnAliceWallet from "../../../../scripts/aliceWallet.js";
import { RegTestWallet, NFTCapability, SendRequest, TokenSendRequest } from "mainnet-js";

import { binToHex, encodeTransactionBch, hexToBin, stringify } from '@bitauth/libauth';

import CatDex, { OrderRequest } from '../index.js';

test('Should swap assets on a blackboard (buy)', async t => {

    const alice = await getAnAliceWallet(500_000)

    await alice.sendMax(alice.getDepositAddress())

    const genesisResponse = await alice.tokenGenesis({
        cashaddr: alice.getTokenDepositAddress(),      // token UTXO recipient, if not specified will default to sender's address
        amount: BigInt(21e14),                         // fungible token amount
        value: 1000,                                   // Satoshi value
    });
    let assetCat = genesisResponse.tokenIds![0]!

    await alice.sendMax(alice.getDepositAddress())

    const mintingResponse = await alice.tokenGenesis({
        cashaddr: alice.tokenaddr!,        // token UTXO recipient, if not specified will default to sender's address
        commitment: "regtest baton",       // NFT Commitment message
        capability: NFTCapability.minting, // NFT capability
        value: 1000,                       // Satoshi value
    });
    let authCat = mintingResponse.tokenIds![0]!
    //@ts-ignore
    let privateKey = getHdPrivateKey(alice.mnemonic!, alice.derivationPath.slice(0, -2), alice.isTestnet)

    await sleep(1000)

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
            quantity: -10000n
        }
    ]


    // Fund the exchange
    const tx = CatDex.administer(authToken, assetCat, [], order, walletUtxos, privateKey);

    t.assert(encodeTransactionBch(tx.transaction).length > 0, "transaction hex have a non-zero length")
    t.is(tx.verify, true, "transaction if valid")
    let response = await alice.provider.sendRawTransaction(binToHex(encodeTransactionBch(tx.transaction)))
    t.is(response.length, 64, "transaction hash returns")
    await sleep(2000)

    // @ts-ignore
    let utxos = await alice.provider.performRequest(
        "blockchain.address.listunspent",
        CatDex.getAddress(authCat, assetCat, "bchreg"),
        "include_tokens"
    )
    // @ts-ignore
    walletUtxos = await alice.provider.performRequest(
        "blockchain.address.listunspent",
        alice.getDepositAddress(),
        "include_tokens"
    )

    const orders = CatDex.getCatDexOrdersFromUtxos(assetCat, utxos)

    await sleep(100)
    // Fund the exchange
    let tx2 = CatDex.swap(10000n, orders, walletUtxos, privateKey);

    // console.log(stringify(tx2.verify))
    // console.log(stringify(tx2.sourceOutputs))
    // console.log(stringify(tx2.transaction))
    // console.log(binToHex(encodeTransactionBch(tx2.transaction)))

    let input0 = tx2.sourceOutputs[0]
    let output0 = tx2.transaction.outputs[0]
    let input1 = tx2.sourceOutputs[1]
    let output1 = tx2.transaction.outputs[1]
    t.deepEqual(input0?.token?.category, hexToBin(authCat), "input0 auth cat matches")
    t.is(input0?.token?.nft?.capability, "mutable", "input0 authcat is mutable")
    t.deepEqual(output0?.token?.category, hexToBin(authCat), "output0 authcat matches")
    t.is(output0?.token?.nft?.capability, "mutable", "output0 authcat is mutable")

    t.deepEqual(input0?.lockingBytecode, output0?.lockingBytecode, "input0 lockingbytecode continues")
    t.deepEqual(input1?.lockingBytecode, output1?.lockingBytecode, "input1 lockingbytecode continues")

    if (output1?.token?.amount! > 0n) {
        t.deepEqual(output1?.token?.category, hexToBin(assetCat), "output1 assetCat matches")
    }

    let orderData = CatDex.parseNFT(input0?.token?.nft?.commitment!)

    let outTokenAmount = output1?.token?.amount ? output1?.token?.amount : 0n
    let tradeQuantity = outTokenAmount - input1?.token?.amount!

    let nextCommitment = CatDex.encodeNFT(
        {
            quantity: orderData.quantity - tradeQuantity,
            price: orderData.price
        }
    )
    t.deepEqual(output0?.token?.nft?.commitment, nextCommitment, "commitment matches")

    t.is(tradeQuantity > 0 == orderData.quantity > 0, true, "order sign matches trade sign")
    t.is(Math.abs(Number(tradeQuantity)) <= Math.abs(Number(orderData.quantity)), true, "trade amount is available")

    t.is(
        output0?.valueSatoshis! - input0?.valueSatoshis! >= -(tradeQuantity * BigInt(orderData.price) / 100_000_000n),
        true,
        "price is right"
    )
    t.is(tx2.verify, true, "transaction is valid")
    let response2 = await alice.provider.sendRawTransaction(binToHex(encodeTransactionBch(tx2.transaction)))

    t.is(response2.length, 64, "transaction hash returns")
});


test('Should swap assets on a blackboard (sell)', async t => {

    const alice = await getAnAliceWallet(500_000)

    await alice.sendMax(alice.getDepositAddress())

    const genesisResponse = await alice.tokenGenesis({
        cashaddr: alice.getTokenDepositAddress(),      // token UTXO recipient, if not specified will default to sender's address
        amount: BigInt(21e14),                         // fungible token amount
        value: 1000,                                   // Satoshi value
    });
    let assetCat = genesisResponse.tokenIds![0]!

    await alice.sendMax(alice.getDepositAddress())

    const mintingResponse = await alice.tokenGenesis({
        cashaddr: alice.tokenaddr!,        // token UTXO recipient, if not specified will default to sender's address
        commitment: "regtest baton",       // NFT Commitment message
        capability: NFTCapability.minting, // NFT capability
        value: 1000,                       // Satoshi value
    });
    let authCat = mintingResponse.tokenIds![0]!
    //@ts-ignore
    let privateKey = getHdPrivateKey(alice.mnemonic!, alice.derivationPath.slice(0, -2), alice.isTestnet)

    await sleep(2000)

    // @ts-ignore
    let walletUtxos = await alice.provider.performRequest(
        "blockchain.address.listunspent",
        alice.getDepositAddress(),
        "include_tokens"
    )

    let authToken = walletUtxos.filter((u: UtxoI) => u.token_data && u.token_data.category == authCat)[0]

    let order: OrderRequest[] = [
        {
            price: 21,
            quantity: 10000n
        },
        {
            price: 20,
            quantity: -10000n
        }
    ]


    // Fund the exchange
    const tx = CatDex.administer(authToken, assetCat, [], order, walletUtxos, privateKey);

    t.assert(encodeTransactionBch(tx.transaction).length > 0, "transaction hex have a non-zero length")
    t.is(tx.verify, true, "transaction if valid")
    let response = await alice.provider.sendRawTransaction(binToHex(encodeTransactionBch(tx.transaction)))
    t.is(response.length, 64, "transaction hash returns")

    await sleep(1000)

    // @ts-ignore
    let utxos = await alice.provider.performRequest(
        "blockchain.address.listunspent",
        CatDex.getAddress(authCat, assetCat, "bchreg"),
        "include_tokens"
    )
    // @ts-ignore
    walletUtxos = await alice.provider.performRequest(
        "blockchain.address.listunspent",
        alice.getDepositAddress(),
        "include_tokens"
    )

    let orders = CatDex.getCatDexOrdersFromUtxos(assetCat, utxos)

    //console.log(stringify(orders))
    // Use the exchange
    let tx2 = CatDex.swap(-900n, orders, walletUtxos, privateKey);
    // console.log(stringify(tx2.verify))
    //  console.log(stringify(tx2.sourceOutputs))
    //  console.log(stringify(tx2.transaction))
    // console.log(binToHex(encodeTransactionBch(tx2.transaction)))

    t.is(tx2.verify, true, "transaction is valid")
    let response2 = await alice.provider.sendRawTransaction(binToHex(encodeTransactionBch(tx2.transaction)))
    t.is(response2.length, 64, "transaction hash returns")
});


test('Should buy swap assets on a blackboard (multi order sell)', async t => {

    const alice = await getAnAliceWallet(500_000)

    await alice.sendMax(alice.getDepositAddress())

    const genesisResponse = await alice.tokenGenesis({
        cashaddr: alice.getTokenDepositAddress(),      // token UTXO recipient, if not specified will default to sender's address
        amount: BigInt(21e14),                         // fungible token amount
        value: 1000,                                   // Satoshi value
    });
    let assetCat = genesisResponse.tokenIds![0]!

    await alice.sendMax(alice.getDepositAddress())

    const mintingResponse = await alice.tokenGenesis({
        cashaddr: alice.tokenaddr!,        // token UTXO recipient, if not specified will default to sender's address
        commitment: "regtest baton",       // NFT Commitment message
        capability: NFTCapability.minting, // NFT capability
        value: 1000,                       // Satoshi value
    });
    let authCat = mintingResponse.tokenIds![0]!
    //@ts-ignore
    let privateKey = getHdPrivateKey(alice.mnemonic!, alice.derivationPath.slice(0, -2), alice.isTestnet)

    await sleep(2000)

    // @ts-ignore
    let walletUtxos = await alice.provider.performRequest(
        "blockchain.address.listunspent",
        alice.getDepositAddress(),
        "include_tokens"
    )

    let authToken = walletUtxos.filter((u: UtxoI) => u.token_data && u.token_data.category == authCat)[0]

    let order: OrderRequest[] = [
        {
            price: 4,
            quantity: 10000n
        },
        {
            price: 3,
            quantity: 10000n
        },
        {
            price: 5,
            quantity: -10000n
        },
        {
            price: 6,
            quantity: -10000n
        }
    ]


    // Fund the exchange
    const tx = CatDex.administer(authToken, assetCat, [], order, walletUtxos, privateKey);

    t.assert(encodeTransactionBch(tx.transaction).length > 0, "transaction hex have a non-zero length")
    t.is(tx.verify, true, "transaction if valid")
    let response = await alice.provider.sendRawTransaction(binToHex(encodeTransactionBch(tx.transaction)))
    t.is(response.length, 64, "transaction hash returns")

    await sleep(1000)

    // @ts-ignore
    let utxos = await alice.provider.performRequest(
        "blockchain.address.listunspent",
        CatDex.getAddress(authCat, assetCat, "bchreg"),
        "include_tokens"
    )
    // @ts-ignore
    walletUtxos = await alice.provider.performRequest(
        "blockchain.address.listunspent",
        alice.getDepositAddress(),
        "include_tokens"
    )

    let orders = CatDex.getCatDexOrdersFromUtxos(assetCat, utxos)

    //console.log(stringify(orders))
    // Use the exchange
    let tx2 = CatDex.swap(19000n, orders, walletUtxos, privateKey);

    t.is(tx2.verify, true, "transaction is valid")
    let response2 = await alice.provider.sendRawTransaction(binToHex(encodeTransactionBch(tx2.transaction)))
    t.is(response2.length, 64, "transaction hash returns")
});

test('Should sell swap assets on a blackboard (from multi order buy)', async t => {

    const alice = await getAnAliceWallet(500_000)

    await alice.sendMax(alice.getDepositAddress())

    const genesisResponse = await alice.tokenGenesis({
        cashaddr: alice.getTokenDepositAddress(),      // token UTXO recipient, if not specified will default to sender's address
        amount: BigInt(21e14),                         // fungible token amount
        value: 1000,                                   // Satoshi value
    });
    let assetCat = genesisResponse.tokenIds![0]!

    await alice.sendMax(alice.getDepositAddress())

    const mintingResponse = await alice.tokenGenesis({
        cashaddr: alice.tokenaddr!,        // token UTXO recipient, if not specified will default to sender's address
        commitment: "regtest baton",       // NFT Commitment message
        capability: NFTCapability.minting, // NFT capability
        value: 1000,                       // Satoshi value
    });
    let authCat = mintingResponse.tokenIds![0]!
    //@ts-ignore
    let privateKey = getHdPrivateKey(alice.mnemonic!, alice.derivationPath.slice(0, -2), alice.isTestnet)

    await sleep(2000)

    // @ts-ignore
    let walletUtxos = await alice.provider.performRequest(
        "blockchain.address.listunspent",
        alice.getDepositAddress(),
        "include_tokens"
    )

    let authToken = walletUtxos.filter((u: UtxoI) => u.token_data && u.token_data.category == authCat)[0]

    let order: OrderRequest[] = [
        {
            price: 4,
            quantity: 500n
        },
        {
            price: 3,
            quantity: 500n
        },
        {
            price: 2,
            quantity: 500n
        },
        {
            price: 5,
            quantity: -10000n
        },
        {
            price: 6,
            quantity: -10000n
        }
    ]


    // Fund the exchange
    const tx = CatDex.administer(authToken, assetCat, [], order, walletUtxos, privateKey);

    t.assert(encodeTransactionBch(tx.transaction).length > 0, "transaction hex have a non-zero length")
    t.is(tx.verify, true, "transaction if valid")
    let response = await alice.provider.sendRawTransaction(binToHex(encodeTransactionBch(tx.transaction)))
    t.is(response.length, 64, "transaction hash returns")

    await sleep(1000)

    // @ts-ignore
    let utxos = await alice.provider.performRequest(
        "blockchain.address.listunspent",
        CatDex.getAddress(authCat, assetCat, "bchreg"),
        "include_tokens"
    )
    // @ts-ignore
    walletUtxos = await alice.provider.performRequest(
        "blockchain.address.listunspent",
        alice.getDepositAddress(),
        "include_tokens"
    )

    let orders = CatDex.getCatDexOrdersFromUtxos(assetCat, utxos)

    //console.log(stringify(orders))
    // Use the exchange
    let tx2 = CatDex.swap(-1500n, orders, walletUtxos, privateKey);
    //  console.log(stringify(tx2.verify))
    //  console.log(stringify(tx2.sourceOutputs))
    //  console.log(stringify(tx2.transaction))
    // console.log(binToHex(encodeTransactionBch(tx2.transaction)))

    await sleep(3000)
    t.is(tx2.verify, true, "transaction is valid")
    let response2 = await alice.provider.sendRawTransaction(binToHex(encodeTransactionBch(tx2.transaction)))
    t.is(response2.length, 64, "transaction hash returns")
});