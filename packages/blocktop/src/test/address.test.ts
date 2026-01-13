import test from 'ava';
import { getHdPrivateKey, TransactionRequest } from "@unspent/tau";
// @ts-ignore
import getAnAliceWallet from "../../../../scripts/aliceWallet.js";
import { RegTestWallet } from "mainnet-js";

import BlockTop from "../index.js";


test.skip('test block top covenant address', async t => {
  const alice = await getAnAliceWallet(500_000)
  //alice.provider = regTest
  const aliceBalance = await alice.getBalance('sats') as number
  t.is(aliceBalance, 500000);

  /* cspell:disable-next-line */
  t.is(BlockTop.getAddress(), "")
  /* cspell:disable-next-line */
  t.is(BlockTop.getAddress("bchreg"), "")
  /* cspell:disable-next-line */
  t.is(BlockTop.getAddress("bchtest"), "")

});
