import test from 'ava';
import { CHANNEL_ADDRESSES } from './fixtures/index.js';

//import type { AddressListUnspentEntry } from '@unspent/tau';

import { Channel } from '../index.js';


test('Should calculate a channel addresses', (t) => {

    t.assert(CHANNEL_ADDRESSES[""] == Channel.getAddress(""), "Main chan address should match")
    t.assert(CHANNEL_ADDRESSES["btc"] == Channel.getAddress("btc"), "btc chan address should match")
    t.assert(CHANNEL_ADDRESSES["test"] == Channel.getAddress("test"), "test chan address should match")
});

