import test from 'ava';

import { binToHex,  encodeTransaction } from '@bitauth/libauth';
import { CONTRACT_UTXO, WALLET_UTXO } from './fixtures/index.js';


import Wrap from '../index.js';

test('Should build a wrapped transaction', (t) => {
    
    //@ts-ignore
    let privateKey = process.env["PRIVATE_KEY"]!
    const tx = Wrap.swap(10000, CONTRACT_UTXO, WALLET_UTXO, privateKey);
        t.assert(tx.length > 0, "transaction hex have a non-zero length")

});