import test from 'ava';

import BlockPoint from "../index.js";


// Async arrow function
test('test blockpoint covenant address', async t => {
  

  t.is(BlockPoint.getAddress(), "bitcoincash:r06fp2k6ux4c6dq8dpafmmpapq9julzfpk04k5309zhmu2vw20mh7srlt9cr9")
  t.is(BlockPoint.getAddress("bchreg"), "bchreg:r0ak899wsk9mr9wz78tw2pnppumzry6ypejfvsad6u4vrj4kdewpwxkpfwslk")
  t.is(BlockPoint.getAddress("bchtest"), "bchtest:r0ak899wsk9mr9wz78tw2pnppumzry6ypejfvsad6u4vrj4kdewpwnunrf8g7")


});
