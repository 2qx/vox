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

test('Should swap assets on a blackboard', async t => {

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


    // @ts-ignore
    let walletUtxos = await alice.provider.performRequest(
        "blockchain.address.listunspent",
        alice.getDepositAddress(),
        "include_tokens"
    )

    let authToken = walletUtxos.filter((u: UtxoI) => u.token_data && u.token_data.category == authCat)[0]

    let order: OrderRequest[] = [
        {
            price: 20n,
            quantity: 10000n
        },
        {
            price: 20n,
            quantity: -10000n
        }
    ]


    const tx = CatDex.administer(authToken, assetCat, [], order, walletUtxos, privateKey);

    t.assert(encodeTransactionBch(tx.transaction).length > 0, "transaction hex have a non-zero length")
    t.is(tx.verify, true, "transaction if valid")
    let response = await alice.provider.sendRawTransaction(binToHex(encodeTransactionBch(tx.transaction)))
    
    await sleep(500)

    // @ts-ignore
    let utxos = await alice.provider.performRequest(
        "blockchain.address.listunspent",
        CatDex.getAddress(authCat, assetCat, "bchreg"),
        "include_tokens"
    )

    console.log(utxos)
    const orders = CatDex.getCatDexOrdersFromUtxos(authCat, assetCat, utxos)

    console.log(orders)
    let tx2 = CatDex.swap(500n, orders, walletUtxos, privateKey);

    let response2 = await alice.provider.sendRawTransaction(binToHex(encodeTransactionBch(tx2.transaction)))

    console.log(response2)
});