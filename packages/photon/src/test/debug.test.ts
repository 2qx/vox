import test from 'ava';
import { getHdPrivateKey, NFTCapability, TransactionRequest } from "@unspent/tau";
// @ts-ignore
import getAnAliceWallet from "../../../../scripts/aliceWallet.js";
import { RegTestWallet, Wallet } from "mainnet-js";

import Photon from "../index.js";
import { binToHex, encodeTransactionBch } from '@bitauth/libauth';


test.skip('test block top tx', async t => {
    const alice = await getAnAliceWallet(500_000)
    //alice.provider = regTest
    const aliceBalance = await alice.getBalance()
    t.is(aliceBalance, 500000n);

    let bob = await RegTestWallet.newRandom()
    let minerKey = getHdPrivateKey(bob.mnemonic!, bob.derivationPath.slice(0, -2), bob.isTestnet)

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

    let tx = Photon.generateTemplate(
        0,
        utxo,
        minerKey,
        alice.getTokenDepositAddress()
    )

    console.log(tx)
    /* cspell:disable-next-line */
    t.is("", "")

});
