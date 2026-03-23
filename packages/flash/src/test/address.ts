import test from 'ava';

import FlashLoan from "../index.js";


// Async arrow function
test('test flash loan address', async t => {

  
    t.is(FlashLoan.getAddress(), "bitcoincash:rwvwtqdsjzumh4nm7xlmzt0ga8z20s5g4ndryrv0xptaanjmadvsymx7l5c8y")
    t.is(FlashLoan.getAddress("bchtest"), "bchtest:rwvwtqdsjzumh4nm7xlmzt0ga8z20s5g4ndryrv0xptaanjmadvsycp0pvtjk")

});
