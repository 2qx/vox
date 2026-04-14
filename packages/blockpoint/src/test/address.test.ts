import test from 'ava';

import BlockPoint from "../index.js";


// Async arrow function
test('test blockpoint covenant address', async t => {
  

  t.is(BlockPoint.getAddress(), "bitcoincash:r06fp2k6ux4c6dq8dpafmmpapq9julzfpk04k5309zhmu2vw20mh7srlt9cr9")
  t.is(BlockPoint.getAddress("bchreg"), "bchreg:r06fp2k6ux4c6dq8dpafmmpapq9julzfpk04k5309zhmu2vw20mh7xwul6upl")
  t.is(BlockPoint.getAddress("bchtest"), "bchtest:r06fp2k6ux4c6dq8dpafmmpapq9julzfpk04k5309zhmu2vw20mh7nyw4atkh")


});
