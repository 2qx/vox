import test from 'ava';
import { getHdPrivateKey } from "@unspent/tau";
// @ts-ignore
import getAnAliceWallet from "../../../../scripts/aliceWallet.js";
import { RegTestWallet } from "mainnet-js";

import { Vault } from "../index.js";
import {
  binToHex,
  encodeTransactionBCH,
  CashAddressNetworkPrefix,
  stringify
} from '@bitauth/libauth';


test('test future placement', async t => {

  const alice = await getAnAliceWallet(500_000)

  let tFBCH_contract = Vault.getAddress(0, "bchreg" as CashAddressNetworkPrefix)
  const genesisResponse = await alice.tokenGenesis({
    cashaddr: tFBCH_contract,      // token UTXO recipient, if not specified will default to sender's address
    amount: BigInt(21e14),   // fungible token amount
    value: 1000,                    // Satoshi value
  });
  const tFBCH = genesisResponse.tokenIds![0]!;

  const bob = await RegTestWallet.newRandom();
  await alice.sendMax(bob.getDepositAddress())

  let key = getHdPrivateKey(bob.mnemonic!, bob.derivationPath.slice(0, -2), bob.isTestnet)

  const bobBalance = await bob.getBalance('sats') as number
  t.assert(bobBalance >= 498000);

  let provider = bob.provider!

  // @ts-ignore
  let contractUtxos = await provider.performRequest(
    "blockchain.address.listunspent",
    tFBCH_contract,
    "include_tokens"
  )

  contractUtxos = contractUtxos.filter((u: any) => u.token_data!.category == tFBCH)

  // @ts-ignore
  let walletUtxos = await provider.performRequest(
    "blockchain.address.listunspent",
    bob.getDepositAddress(),
    "include_tokens"
  )

  let tx = Vault.swap(
    20000,
    contractUtxos,
    walletUtxos,
    0,
    key
  )
  await provider.sendRawTransaction(binToHex(encodeTransactionBCH(tx.transaction)))
});


test('test future placement with coupon', async t => {

  const alice = await getAnAliceWallet(20_000_000)

  let prefix = "bchreg" as CashAddressNetworkPrefix

  let tFBCH_contract = Vault.getAddress(0, prefix)

  const genesisResponse = await alice.tokenGenesis({
    cashaddr: tFBCH_contract,      // token UTXO recipient, if not specified will default to sender's address
    amount: BigInt(21e14),   // fungible token amount
    value: 1000,                    // Satoshi value
  });
  const tFBCH = genesisResponse.tokenIds![0]!;

   let couponAddr = Vault.getCouponAddress(10_000_000, 0, prefix)
  await alice.send({
    cashaddr: couponAddr,
    value: 10000,
    unit: 'satoshi'
  }); 


  const bob = await RegTestWallet.newRandom();
  await alice.sendMax(bob.getDepositAddress())

 
  

  let key = getHdPrivateKey(bob.mnemonic!, bob.derivationPath.slice(0, -2), bob.isTestnet)

  const bobBalance = await bob.getBalance('sats') as number
  t.assert(bobBalance >= 458000);

  let provider = bob.provider!

  // @ts-ignore
  let contractUtxos = await provider.performRequest(
    "blockchain.address.listunspent",
    tFBCH_contract,
    "include_tokens"
  )

  // @ts-ignore
  let couponUtxos = await provider.performRequest(
    "blockchain.address.listunspent",
    couponAddr,
    "include_tokens"
  )

  contractUtxos = contractUtxos.filter((u: any) => u.token_data!.category == tFBCH)

  // @ts-ignore
  let walletUtxos = await provider.performRequest(
    "blockchain.address.listunspent",
    bob.getDepositAddress(),
    "include_tokens"
  )

  let tx = Vault.swap(
    10_000_000,
    contractUtxos,
    walletUtxos,
    0,
    key,
    couponUtxos[0]
  )
  //console.log(stringify(tx))
  await provider.sendRawTransaction(binToHex(encodeTransactionBCH(tx.transaction)))
});