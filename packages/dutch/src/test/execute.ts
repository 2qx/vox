import test from 'ava';

import { binToHex, encodeTransactionBch, hexToBin } from "@bitauth/libauth";

// @ts-ignore
import getAnAliceWallet from "../../../../scripts/aliceWallet.js";
import { Wallet, RegTestWallet, mine, NFTCapability, TokenMintRequest, TokenSendRequest } from "mainnet-js";
import { sleep, UtxoI, getHdPrivateKey } from "@unspent/tau";
import Dutch from "../index.js";
import { publicKeyToP2PKHLockingBytecode } from '@unspent/tau/signatureTemplate.js';


test('test buying an NFT at auction', async t => {

    const alice = await getAnAliceWallet(2400000000)
    //@ts-ignore
    let privateKey = getHdPrivateKey(alice.mnemonic!, alice.derivationPath.slice(0, -2), alice.isTestnet)

    let provider = alice.provider!


    let alice_pkh = alice.getPublicKeyHash(false) as Uint8Array
    let alice_lockingBytecode = publicKeyToP2PKHLockingBytecode(alice_pkh)
    // Make a "main" badger token.

    let data = {
        recipient: binToHex(alice_lockingBytecode),
        open: 100_000
    }

    let recordCommitment = Dutch.encodeCommitment(data)

    let record = {
        height: 907664,
        tx_hash: "deaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddead",
        tx_pos: 1,
        token_data: {
            category: "deaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddead",
            nft: {
                commitment: recordCommitment,
                capability: "none"
            },
            amount: "0"
        },
        value: 800
    } as UtxoI

    let contract_address = Dutch.getAddress(data, "bchreg");
    const genesisResponse = await alice.tokenGenesis({
        capability: NFTCapability.none,
        commitment: "anything goes",
        amount: 1000000000n,
        cashaddr: contract_address,
        value: 800,                    // Satoshi value
    });
    const tokenId = genesisResponse.tokenIds![0]!;


    await mine({
        /* cspell:disable-next-line */
        cashaddr: "bchreg:ppt0dzpt8xmt9h2apv9r60cydmy9k0jkfg4atpnp2f",
        blocks: 10,
    });

    sleep(1000)
    // @ts-ignore
    let auctionUtxos = await provider.performRequest(
        "blockchain.address.listunspent",
        contract_address,
        "include_tokens"
    )

    // @ts-ignore
    let utxos = await provider.performRequest(
        "blockchain.address.listunspent",
        alice.getTokenDepositAddress(),
        "exclude_tokens"
    )

    let height = await provider.getBlockHeight()

    let bidTx = Dutch.execute(
        record,
        auctionUtxos[0],
        utxos,
        height,
        privateKey
    )

    await sleep(1000);

    // @ts-ignore
    let response = await provider.performRequest(
        "blockchain.transaction.broadcast",
        binToHex(encodeTransactionBch(bidTx.transaction))
    )

    t.assert(response.length>=32)
    t.truthy(bidTx.verify)

    await sleep(1000);

    let aliceNfts = await alice.getAllNftTokenBalances()
    t.assert(aliceNfts[tokenId]==1)


});
