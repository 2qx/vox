import test from 'ava';

import {
  hexToBin
} from '@bitauth/libauth';
import CatDex from "../index.js";


test('should serialize and deserialize order commitments', async t => {

  const or_0_20 = "0000000000000000000000000000000000943577000000000000000000000000"

  const order = CatDex.parseNFT(hexToBin(or_0_20))

  t.deepEqual(CatDex.encodeNFT({ price: 20, quantity: 0n }), hexToBin(or_0_20))
  t.deepEqual(order.price ,  20n)
  t.deepEqual(order.quantity ,  0n)

});


test('should serialize and deserialize (sell) order commitments', async t => {

  const or_n20_20 = "1400000000000000000000000000008000943577000000000000000000000000"

  const order = CatDex.parseNFT(hexToBin(or_n20_20))

  t.deepEqual(CatDex.encodeNFT({ price: 20, quantity: -20n }), hexToBin(or_n20_20))
  t.deepEqual(order.price ,  20n)
  t.deepEqual(order.quantity ,  -20n)

});
