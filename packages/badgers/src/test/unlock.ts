import test from 'ava';

import { binToHex, encodeTransactionBch, hexToBin } from "@bitauth/libauth";

// @ts-ignore
import getAnAliceWallet from "../../../../scripts/aliceWallet.js";
import { Wallet, RegTestWallet, mine, NFTCapability, TokenMintRequest, TokenSendRequest } from "mainnet-js";
import { sleep, UtxoI, getHdPrivateKey } from "@unspent/tau";
import BadgerStake from "../index.js";


test('test staking and unstaking badgers', async t => {

    const alice = await getAnAliceWallet(2400000000)
    //@ts-ignore
    let privateKey = getHdPrivateKey(alice.mnemonic!, alice.derivationPath.slice(0, -2), alice.isTestnet)

    let provider = alice.provider!


    let admin_pkh = alice.getPublicKeyHash(true) as string
    // Make a "main" badger token.

    let masterCommitment = BadgerStake.encodeNFT({
        admin_pkh: hexToBin(admin_pkh),
        fee: 1000,
        amount: 800
    })

    const genesisResponse = await alice.tokenGenesis({
        capability: NFTCapability.minting,
        commitment: binToHex(masterCommitment),
        amount: 1000000000n,
        value: 10000,                    // Satoshi value
    });
    const tokenId = genesisResponse.tokenIds![0]!;

    let contract_address = BadgerStake.getAddress(tokenId, "bchreg");

    await alice.send(new TokenSendRequest({
        cashaddr: contract_address,
        tokenId: tokenId,
        amount: 1000000000n,
        commitment: binToHex(masterCommitment),
        capability: NFTCapability.minting
    }))

    sleep(1000)
    // @ts-ignore
    let mainUtxos = await provider.performRequest(
        "blockchain.address.listunspent",
        contract_address,
        "include_tokens"
    )


    console.log(mainUtxos[0])
    // @ts-ignore
    let utxos = await provider.performRequest(
        "blockchain.address.listunspent",
        alice.getTokenDepositAddress(),
        "exclude_tokens"
    )

    let lockTx = BadgerStake.lock(
        mainUtxos[0],
        100_000_000,
        9,
        utxos,
        privateKey)

    console.log(lockTx)
    await sleep(1000);

    // @ts-ignore
    let response = await provider.performRequest(
        "blockchain.transaction.broadcast",
        binToHex(encodeTransactionBch(lockTx.transaction))
    )

    console.log(response)

    await mine({
        /* cspell:disable-next-line */
        cashaddr: "bchreg:ppt0dzpt8xmt9h2apv9r60cydmy9k0jkfg4atpnp2f",
        blocks: 10,
    });


    // @ts-ignore
    let contractUtxos = await provider.performRequest(
        "blockchain.address.listunspent",
        contract_address,
        "include_tokens"
    )


    let currentHeight = await provider.getBlockHeight()
    contractUtxos = contractUtxos.filter((u: any) => u.height + u.value < currentHeight)

    let transaction = BadgerStake.unlock(contractUtxos[0])

    const oldLength = contractUtxos.length

    // @ts-ignore
    await provider.performRequest(
        "blockchain.transaction.broadcast",
        binToHex(encodeTransactionBch(transaction.transaction))
    )


    await sleep(1000);

    // @ts-ignore
    contractUtxos = await provider.performRequest(
        "blockchain.address.listunspent",
        contract_address,
        "include_tokens"
    )
    contractUtxos = contractUtxos.filter((u: any) => u.height + u.value < currentHeight)

    t.assert(oldLength - contractUtxos.length == 1)

});
