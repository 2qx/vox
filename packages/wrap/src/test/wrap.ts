import test from 'ava';

import { binToHex,   encodeTransactionBCH } from '@bitauth/libauth';
import { CONTRACT_UTXOS, WALLET_UTXOS } from './fixtures/index.js';


import Wrap from '../index.js';

test('Should build a wrapped transaction', (t) => {
    
    //@ts-ignore
    let privateKey = process.env["PRIVATE_KEY"]!
    const tx = Wrap.swap(10000, CONTRACT_UTXOS, WALLET_UTXOS, privateKey);
        t.assert(encodeTransactionBCH(tx.transaction).length > 0, "transaction hex have a non-zero length")

});