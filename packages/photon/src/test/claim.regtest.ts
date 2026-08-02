import test from 'ava';
import {
  encodeTransactionBch,
  binToHex,
} from '@bitauth/libauth';
import { getHdPrivateKey, getTransactionId, sleep } from "@unspent/tau";
// @ts-ignore
import getAnAliceWallet from "@unspent/tau/testUtil.js";
import { RegTestWallet } from "@unspent/wallet";

import Photon from "../index.js";

test('test mine function', async t => {


  const alice = await getAnAliceWallet(100_010_000)

  let contract = Photon.getAddress("bchreg")
  const genesisResponse = await alice.tokenGenesis({
    cashaddr: contract,      // token UTXO recipient, if not specified will default to sender's address
    amount: BigInt(21e14),   // fungible token amount
    value: 1000n,             // Satoshi value
    nft: {
      capability: "mutable",
      commitment: "00000000"+"9863bfb8140e6a63bfb8140e6a63bfb8140e6a63bfb8140e6a63bfb8140eff7f"
    }
  });
  
  const tokenId = genesisResponse.categories![0]!;

  const bob = await RegTestWallet.newRandom();
  await alice.sendMax(bob.getDepositAddress())

  await sleep(200);
  let key = getHdPrivateKey(bob.mnemonic!, bob.derivationPath.slice(0, -2), bob.isTestnet)

  const bobBalance = await bob.getBalance()
  t.assert(bobBalance >= 100_000_000);

  let provider = bob.provider!


  // @ts-ignore
  let contractUtxos = await provider.performRequest(
    "blockchain.address.listunspent",
    contract,
    "include_tokens"
  )

  contractUtxos = contractUtxos.filter((u: any) => u.token_data!.category == tokenId)


  let now = await provider.getBlockHeight();

  let tx = Photon.generateTemplate(
    now,
    contractUtxos[0],
    key,
    bob.getTokenDepositAddress(),
    tokenId
  )

  console.debug("tx: ", tx)

});


