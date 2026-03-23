import test from 'ava';

import Subscription from "../index.js";
import { TEST_RECORD_UTXO } from './fixtures/index.js';
import { binToHex, binToNumberInt16LE, binToNumberUintLE, binToUtf8, hexToBin } from '@bitauth/libauth';
import { TokenCapabilities } from '@unspent/tau';


// Async arrow function
test('test encoding subscription NFT commitment', async t => {

    const data = {
        installment: 1000n,
        recipient: hexToBin("a914e78564d75c446f8c00c757a2bd783d30c4f0819a87"),
        period: 144,
        auth: hexToBin("0000000000000000000000000000000000000000000000000000000000000000")
    }

    let commitment = Subscription.encodeCommitment(data)
    t.is(
        commitment, "0355335302e80317a914e78564d75c446f8c00c757a2bd783d30c4f0819a87029000"
    )

});

test('test parsing subscription NFT', async t => {

    const record = {
        tx_pos: 0,
        tx_hash: "00",
        value: 800,
        height: -1,
        token_data: {
            category: "beef00000000000000000000000000000000000000000000000000000000beef",
            amount: "0",
            nft: {
                capability: "mutable" as TokenCapabilities,
                commitment: "0355335302e80317a914e78564d75c446f8c00c757a2bd783d30c4f0819a87029000"
            }
        }
    }

    let data = Subscription.parseNFT(record)
    t.is(binToNumberUintLE(data["installment"]!), 1000)
    t.is(binToHex(data["recipient"]!), "a914e78564d75c446f8c00c757a2bd783d30c4f0819a87")
    t.is(binToNumberInt16LE(data["period"]!), 144)


});



