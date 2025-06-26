import test from 'ava';

import {
  binToHex,
  encodeTransaction
} from "@bitauth/libauth";

import { SAMPLE_UTXO_TXHASH, TERMINAL_UTXO_TXHASH, TXN_VALID } from './fixtures/index.js';

import type { UtxoI } from '@unspent/tau';

import DripV3 from '../index.js';

test('Should drip a minimum transaction', (t) => {

  const utxo = SAMPLE_UTXO_TXHASH as UtxoI
  const result = DripV3.processOutpoint(utxo);
  const tx = encodeTransaction(result)
  const txHex = binToHex(tx)
  t.assert(txHex == TXN_VALID, "transaction hex should match")
  
});


test('Should create a terminate transaction, if below payout threshold', (t) => {

  const utxo = TERMINAL_UTXO_TXHASH as UtxoI
  const result = DripV3.processOutpoint(utxo);
  let output = result.outputs[0]!
  t.assert(binToHex(output.lockingBytecode) == "6a", "pay to op_return")
  t.assert(output.valueSatoshis == 0n, "pay have zero value")

});