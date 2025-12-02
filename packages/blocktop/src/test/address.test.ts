import test from 'ava';
import { getHdPrivateKey, TransactionRequest } from "@unspent/tau";
// @ts-ignore
import getAnAliceWallet from "../../../../scripts/aliceWallet.js";
import { RegTestWallet } from "mainnet-js";

import BlockTop from "../index.js";


// Async arrow function
test.skip('test wrap covenant address', async t => {
  const alice = await getAnAliceWallet(500_000)
  //alice.provider = regTest
  const aliceBalance = await alice.getBalance('sats') as number
  t.is(aliceBalance, 500000);

  t.is(BlockTop.getAddress(), "bitcoincash:r0ak899wsk9mr9wz78tw2pnppumzry6ypejfvsad6u4vrj4kdewpwsmza35av")
  t.is(BlockTop.getAddress("bchreg"), "bchreg:r0ak899wsk9mr9wz78tw2pnppumzry6ypejfvsad6u4vrj4kdewpwxkpfwslk")
  t.is(BlockTop.getAddress("bchtest"), "bchtest:r0ak899wsk9mr9wz78tw2pnppumzry6ypejfvsad6u4vrj4kdewpwnunrf8g7")

});
