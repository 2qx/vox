import test from 'ava';
import { getHdPrivateKey, NFTCapability, TransactionRequest } from "@unspent/tau";
// @ts-ignore
import getAnAliceWallet from "../../../../scripts/aliceWallet.js";
import { RegTestWallet } from "mainnet-js";

import BlockTop from "../index.js";
import { binToHex, encodeTransactionBch } from '@bitauth/libauth';


test.skip('test block top tx', async t => {
    const alice = await getAnAliceWallet(500_000)
    //alice.provider = regTest
    const aliceBalance = await alice.getBalance('sats') as number
    t.is(aliceBalance, 500000);

    const utxo = {
        tx_pos: 0,
        tx_hash: "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        height: -1,
        value: 400,
        token_data: {
            amount: "0", category: "0000000000000000000000000000000000000000000000000000000000000002", nft: {
                capability: "mutable" as NFTCapability, commitment: "0004"
            }

        }
    }

    let response = BlockTop.claim(
        0,
        utxo
    )

    let tx = binToHex(encodeTransactionBch(response.transaction))
    console.log(tx)
    /* cspell:disable-next-line */
    t.is("", "")
    
});
