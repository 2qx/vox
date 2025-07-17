import test from 'ava';
import { getHdPrivateKey, TransactionRequest } from "@unspent/tau";
// @ts-ignore
import getAnAliceWallet from "../../../../scripts/aliceWallet.js";
import { RegTestWallet, mine } from "mainnet-js";

import BlockPoint from "../index.js";


test('test claim function with key', async t => {

  const alice = await getAnAliceWallet(100_003_000)

  let contract = BlockPoint.getAddress("bchreg")
  const genesisResponse = await alice.tokenGenesis({
    cashaddr: contract,      // token UTXO recipient, if not specified will default to sender's address
    amount: BigInt(21e14),   // fungible token amount
    value: 1000,                    // Satoshi value
  });
  const tokenId = genesisResponse.tokenIds![0]!;

  const bob = await RegTestWallet.newRandom();
  await alice.sendMax(bob.getDepositAddress())

  let key = getHdPrivateKey(bob.mnemonic!, bob.derivationPath.slice(0, -2), bob.isTestnet)

  const bobBalance = await bob.getBalance('sats') as number
  t.assert(bobBalance >= 100_000_000);

  let provider = bob.provider!

  // @ts-ignore
  let contractUtxos = await provider.performRequest(
    "blockchain.address.listunspent",
    contract,
    "include_tokens"
  )

  contractUtxos = contractUtxos.filter((u: any) => u.token_data!.category == tokenId)

  // @ts-ignore
  let walletUtxos = await provider.performRequest(
    "blockchain.address.listunspent",
    bob.getDepositAddress(),
    "include_tokens"
  )

  await mine({
    /* cspell:disable-next-line */
    cashaddr: "bchreg:ppt0dzpt8xmt9h2apv9r60cydmy9k0jkfg4atpnp2f",
    blocks: 10,
  });


  let tx = BlockPoint.claim(
    10,
    contractUtxos[0],
    walletUtxos[0],
    key,
    tokenId
  )
  await provider.sendRawTransaction(tx)
});


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