
import test from 'ava';

import { binToHex, hexToBin } from '@bitauth/libauth';

import BadgerStake, { StakeRequest, StakeSettings } from "../index.js";

import { MAIN_BADGER_UTXO, STAKE_UTXO } from "./fixtures/index.js"



// Async arrow function
test('test BadgerStake stake parsing', t => {

    let parsed = BadgerStake.parseNFT(STAKE_UTXO) as StakeRequest
    t.is(parsed?.amount, 12287)
    t.is(binToHex(parsed?.user_pkh), "beefbeefbeefbeefbeefbeefbeefbeefbeefbeef")
    t.is(parsed?.stake, 32767)


});

test('Check encoding BadgerStake request', t => {

    let parsed = BadgerStake.parseNFT(STAKE_UTXO) as StakeRequest
    let reEncoded = BadgerStake.encodeNFT(parsed)
    t.deepEqual(hexToBin(STAKE_UTXO.token_data?.nft?.commitment!), reEncoded)

})

// Async arrow function
test('test BadgerStake main nft parsing', t => {

    let parsed = BadgerStake.parseNFT(MAIN_BADGER_UTXO) as StakeSettings
    t.is(parsed?.amount, 9223372036845552464)
    t.is(binToHex(parsed?.admin_pkh), "beefbeefbeefbeefbeefbeefbeefbeefbeefbeef")
    t.is(parsed?.fee, 1000)

});


test('Check encoding BadgerStake settings', t => {

    let parsed = BadgerStake.parseNFT(MAIN_BADGER_UTXO) as StakeSettings
    let reEncoded = BadgerStake.encodeNFT(parsed)
    t.deepEqual(hexToBin(MAIN_BADGER_UTXO.token_data?.nft?.commitment!), reEncoded)

})


test('Check encoding BadgerStake commemorative baton', t => {

    let commitment = BadgerStake.encodeCommemorativeNFT(4660n)
    t.deepEqual(binToHex(commitment), "00003412")

})