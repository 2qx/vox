import test from 'ava';

import {
    hexToBin
} from '@bitauth/libauth';
import { UtxoI } from '@unspent/tau';
import CatDex from "../index.js";

import { ORDER_UTXOS, AUTH, ASSET } from '../fixtures/orderUtxos.js';

test('should orderMatch a request without utxos', async t => {


    let utxos: UtxoI[] = []
    const orders = CatDex.getCatDexOrdersFromUtxos(AUTH, ASSET, utxos)
    t.deepEqual(orders.length, 0)

});


test('should orderMatch a single request', async t => {

    let utxos: UtxoI[] = [ORDER_UTXOS[0]!]
    const orders = CatDex.getCatDexOrdersFromUtxos(AUTH, ASSET, utxos)
    t.deepEqual(orders.length, 1)

});


test('should orderMatch buy and sell orders', async t => {

    let utxos: UtxoI[] = ORDER_UTXOS
    const orders = CatDex.getCatDexOrdersFromUtxos(AUTH, ASSET, utxos);
    t.deepEqual(orders.length, 3)
    t.assert(orders[0]!.assetUtxo)

});