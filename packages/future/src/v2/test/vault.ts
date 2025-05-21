import test from 'ava';



import { VAULT_ADDRESSES, COUPON_ADDRESSES } from './fixtures/index.js';
import { binToHex } from '@bitauth/libauth';
//import type { AddressListUnspentEntry } from '@unspent/tau';

import { Vault } from '../index.js';

test('Should calculate vault unlocking bytecode', (t) => {

    t.assert(
        "00c0d3c0d0a06376b17568c0cec0d188c0cdc0c788c0d0c0c693c0d3c0cc939c77" ==
        binToHex(Vault.getUnlockingBytecode(0)),
        "Coupon vault address should match"
    )
    t.assert(
        "0340420fc0d3c0d0a06376b17568c0cec0d188c0cdc0c788c0d0c0c693c0d3c0cc939c77" ==
        binToHex(Vault.getUnlockingBytecode(1000000)),
        "Coupon vault address should match"
    )

});

test('Should calculate a vault address', (t) => {

    t.assert(
        COUPON_ADDRESSES[1000000]["10000000"] ==
        Vault.getCoupon(10000000, 1000000),
        "Coupon vault address should match"
    )
    t.assert(
        COUPON_ADDRESSES[1000000]["100000000"] ==
        Vault.getCoupon(100000000, 1000000),
        "Coupon vault address should match"
    )
    t.assert(
        COUPON_ADDRESSES[1000000]["1000000000"] ==
        Vault.getCoupon(1000000000, 1000000),
        "Coupon vault address should match"
    )
    t.assert(
        COUPON_ADDRESSES[1000000]["10000000000"] ==
        Vault.getCoupon(10000000000, 1000000),
        "Coupon vault address should match"
    )
});

test('Should calculate a vault coupon address', (t) => {

    t.assert(
        VAULT_ADDRESSES[100000] ==
        Vault.getAddress(100000),
        "Vault Address should match"
    )
    t.assert(
        VAULT_ADDRESSES[900000] ==
        Vault.getAddress(900000),
        "Vault Address should match"
    )
    t.assert(
        VAULT_ADDRESSES[1000000] ==
        Vault.getAddress(1000000),
        "Vault Address should match"
    )
});


