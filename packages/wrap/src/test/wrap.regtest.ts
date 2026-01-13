import test from 'ava';
import { getHdPrivateKey } from "@unspent/tau";
// @ts-ignore
import getAnAliceWallet from "../../../../scripts/aliceWallet.js";
import { RegTestWallet } from "mainnet-js";

import Wrap from "../index.js";
import {
  binToHex,
  cashAddressToLockingBytecode,
  encodeTransactionBch,
  swapEndianness
} from '@bitauth/libauth';

// Async arrow function
test('test wrap covenant address', async t => {
  const alice = await getAnAliceWallet(500_000)
  //alice.provider = regTest
  const aliceBalance = await alice.getBalance('sats') as number
  t.is(aliceBalance, 500000);

  /* cspell:disable-next-line */
  t.is(Wrap.getAddress(), "bitcoincash:r0ujgnc9jnyurzv99678fgac3fdrq8x3py9rlrg6dlnz96qxrdl02t6jek3sw")
  /* cspell:disable-next-line */
  t.not(Wrap.getAddress("bchreg"), "bchreg:r0ujgnc9jnyurzv99678fgac3fdrq8x3py9rlrg6dlnz96qxrdl02t6jek3sw")
  /* cspell:disable-next-line */
  t.is(Wrap.getAddress("bchreg"), "bchreg:r0ujgnc9jnyurzv99678fgac3fdrq8x3py9rlrg6dlnz96qxrdl02ah3df4j5")
  /* cspell:disable-next-line */
  t.is(Wrap.getAddress("bchtest"), "bchtest:r0ujgnc9jnyurzv99678fgac3fdrq8x3py9rlrg6dlnz96qxrdl02gar8wz9u")

});

test('test wrap function with key', async t => {

  const alice = await getAnAliceWallet(500_000)

  let wrap_contract = Wrap.getAddress("bchreg")
  const genesisResponse = await alice.tokenGenesis({
    cashaddr: wrap_contract,      // token UTXO recipient, if not specified will default to sender's address
    amount: BigInt(21e14),   // fungible token amount
    value: 1000,                    // Satoshi value
  });
  const tWBCH = genesisResponse.tokenIds![0]!;

  const bob = await RegTestWallet.newRandom();
  await alice.sendMax(bob.getDepositAddress())

  let key = getHdPrivateKey(bob.mnemonic!, bob.derivationPath.slice(0, -2), bob.isTestnet)

  const bobBalance = await bob.getBalance('sats') as number
  t.assert(bobBalance >= 498000);

  let provider = bob.provider!

  // @ts-ignore
  let contractUtxos = await provider.performRequest(
    "blockchain.address.listunspent",
    wrap_contract,
    "include_tokens"
  )

  contractUtxos = contractUtxos.filter((u: any) => u.token_data!.category == tWBCH)

  // @ts-ignore
  let walletUtxos = await provider.performRequest(
    "blockchain.address.listunspent",
    bob.getDepositAddress(),
    "include_tokens"
  )

  let tx = Wrap.swap(
    20000,
    contractUtxos,
    walletUtxos,
    key,
    tWBCH
  )
  await provider.sendRawTransaction(binToHex(encodeTransactionBch(tx.transaction)))
});


// test('test wrap function unsigned', async t => {

//   const alice = await getAnAliceWallet(500_000)

//   let wrap_contract = Wrap.getAddress("bchreg")
//   const genesisResponse = await alice.tokenGenesis({
//     cashaddr: wrap_contract,      // token UTXO recipient, if not specified will default to sender's address
//     amount: BigInt(21e14),   // fungible token amount
//     value: 1000,                    // Satoshi value
//   });
//   const tWBCH = genesisResponse.tokenIds![0]!;

//   const bob = await RegTestWallet.newRandom();
//   await alice.sendMax(bob.getDepositAddress())

//   let key = getHdPrivateKey(bob.mnemonic!, bob.derivationPath.slice(0, -2), bob.isTestnet)

//   const bobBalance = await bob.getBalance('sats') as number
//   t.assert(bobBalance >= 498000);

//   let provider = bob.provider!

//   // @ts-ignore
//   let contractUtxos = await provider.performRequest(
//     "blockchain.address.listunspent",
//     wrap_contract,
//     "include_tokens"
//   )

//   contractUtxos = contractUtxos.filter((u: any) => u.token_data!.category == tWBCH)

//   // @ts-ignore
//   let walletUtxos = await provider.performRequest(
//     "blockchain.address.listunspent",
//     bob.getDepositAddress(),
//     "include_tokens"
//   )

//   let txRequest = Wrap.swap(
//     20000,
//     contractUtxos[0],
//     [walletUtxos[0]],
//     undefined,
//     tWBCH
//   ) 

//   let signedTx = await alice.signUnsignedTransaction(txRequest.transaction, txRequest.sourceOutputs)
//   await provider.sendRawTransaction(binToHex(signedTx)!)
// });