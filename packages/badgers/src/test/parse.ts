
import test from 'ava';


import BadgerStake from "../index.js";

import { MAIN_BADGER_UTXO, STAKE_UTXO } from "./fixtures/index.js"



// Async arrow function
test('test BadgerStake stake parsing', t => {

    let parsed = BadgerStake.parseNFT(STAKE_UTXO)
    t.is(parsed?.amount, 12287)
    t.is(parsed?.user_pkh, "beefbeefbeefbeefbeefbeefbeefbeefbeefbeef")
    t.is(parsed?.stake, 32767)

});


// Async arrow function
test('test BadgerStake main nft parsing', t => {

    let parsed = BadgerStake.parseNFT(MAIN_BADGER_UTXO)
    t.is(parsed?.amount, 9223372036845552464)
    t.is(parsed?.user_pkh, "beefbeefbeefbeefbeefbeefbeefbeefbeefbeef")
    t.is(parsed?.stake, 1000)

});

