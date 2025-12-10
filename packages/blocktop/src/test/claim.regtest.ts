import test from 'ava';
import { encodeTransactionBch, binToHex, swapEndianness, OpcodeDescriptionsBch2023 } from '@bitauth/libauth';
import { getHdPrivateKey, TransactionRequest } from "@unspent/tau";
// @ts-ignore
import getAnAliceWallet from "../../../../scripts/aliceWallet.js";
import { RegTestWallet, mine } from "mainnet-js";

import BlockTop from "../index.js";

test.skip('test mine function', async t => {


  const alice = await getAnAliceWallet(100_003_000)

  let contract = BlockTop.getAddress("bchreg")
  const genesisResponse = await alice.tokenGenesis({
    cashaddr: contract,      // token UTXO recipient, if not specified will default to sender's address
    amount: BigInt(21e14),   // fungible token amount
    value: 1000,             // Satoshi value
    capability: "mutable",
    commitment:"ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
  });
  const tokenId = genesisResponse.tokenIds![0]!;

  console.log(swapEndianness(tokenId))
  const bob = await RegTestWallet.newRandom();
  await alice.sendMax(bob.getDepositAddress())

  let key = getHdPrivateKey(bob.mnemonic!, bob.derivationPath.slice(0, -2), bob.isTestnet)

  const bobBalance = await bob.getBalance('sats') as number
  t.assert(bobBalance >= 100_000_000);

  let provider = bob.provider!


  await mine({
    /* cspell:disable-next-line */
    cashaddr: "bchreg:ppt0dzpt8xmt9h2apv9r60cydmy9k0jkfg4atpnp2f",
    blocks: 50,
  });


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

  let now = await provider.getBlockHeight();

  let tx = BlockTop.claim(
    now,
    contractUtxos[0],
    key,
    tokenId
  )
  
  let tx_raw = binToHex(encodeTransactionBch(tx.transaction))
  // console.log(tx_raw)
  //await provider.sendRawTransaction(tx_raw)
});


