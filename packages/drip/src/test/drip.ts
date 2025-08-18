import test from 'ava';

import {
  binToHex,
  hexToBin,
  decodeTransactionBCH
} from "@bitauth/libauth";

import { SAMPLE_UTXO_TXHASH, TERMINAL_UTXO_TXHASH, TXN_VALID } from './fixtures/index.js';

import type { UtxoI } from '@unspent/tau';

import DripV3 from '../index.js';

test('Should drip a minimum transaction', (t) => {

  const utxo = SAMPLE_UTXO_TXHASH as UtxoI
  const result = DripV3.processOutpoint(utxo);
  t.is(result, TXN_VALID, "transaction hex should match")

});


test('Should create a terminate transaction, if below payout threshold', (t) => {

  const utxo = TERMINAL_UTXO_TXHASH as UtxoI
  const result = DripV3.processOutpoint(utxo);
  let decoded = decodeTransactionBCH(hexToBin(result))
  if (typeof decoded == "string") throw decoded

  t.assert(binToHex(decoded.outputs[0]!.lockingBytecode) == "6a", "pay to op_return")
  t.assert(decoded.outputs[0]!.valueSatoshis == 0n, "pay have zero value")

});