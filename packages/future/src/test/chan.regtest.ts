import test from 'ava';
import { getHdPrivateKey, TransactionRequest, UtxoI } from "@unspent/tau";
import { encodeTransactionBCH, binToHex } from "@bitauth/libauth";

// @ts-ignore
import getAnAliceWallet from "../../../../scripts/aliceWallet.js";
import { RegTestWallet, mine, NFTCapability } from "mainnet-js";


//import type { AddressListUnspentEntry } from '@unspent/tau';

import { Channel } from '../index.js';


test('Should post a messages', async (t) => {

    const alice = await getAnAliceWallet(100_003_000);
    const bob = await RegTestWallet.newRandom();
    await alice.sendMax(bob.getDepositAddress())

    let provider = bob.provider!

    let key = getHdPrivateKey(bob.mnemonic!, bob.derivationPath.slice(0, -2), bob.isTestnet)

    const bobBalance = await bob.getBalance('sats') as number
    t.assert(bobBalance >= 100_000_000);

    let height = await provider.getBlockHeight()

    t.assert(height >= 100);

    // @ts-ignore
    let walletUtxos = await provider.performRequest(
        "blockchain.address.listunspent",
        bob.getDepositAddress(),
        "include_tokens"
    )

    let uname = "6a03553356" + "0474657374"
    let sendResponse = await bob.tokenGenesis({
      cashaddr: bob.getTokenDepositAddress()!,      // token UTXO recipient, if not specified will default to sender's address
      commitment: uname,             // NFT Commitment message
      capability: NFTCapability.minting, // NFT capability
      value: 1_000_000,                    // Satoshi value
    });


    // @ts-ignore
    walletUtxos = await provider.performRequest(
        "blockchain.address.listunspent",
        bob.getDepositAddress(),
        "include_tokens"
    )
    let auth = walletUtxos.filter((u:UtxoI) => u.token_data?.nft?.commitment == uname)[0]
    t.assert(auth.token_data?.nft?.commitment == uname)

    const post = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer dapibus lacus a enim volutpat consectetur. Aenean eget ornare urna. Suspendisse laoreet posuere luctus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Integer sit amet erat."
    let response = Channel.post("test", post, auth, (height * 10)+1000, key)
    t.assert(response.verify == true)

});

