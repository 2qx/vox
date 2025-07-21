import test from 'ava';

// @ts-ignore
import getAnAliceWallet from "../../../../scripts/aliceWallet.js";
import { Wallet, RegTestWallet, mine, NFTCapability, TokenMintRequest,  } from "mainnet-js";
import { sleep, UtxoI } from "@unspent/tau";
import BadgerStake from "../index.js";


test.skip('test staking and unstaking badgers', async t => {

    const alice = await getAnAliceWallet(100_003_000)
    let provider = alice.provider!

    let contract_address = BadgerStake.getAddress("bchreg");
    let admin_pkh = alice.getPublicKeyHash(true) as string
    // Make a "main" badger token.
    const genesisResponse = await alice.tokenGenesis({
        cashaddr: contract_address, // token UTXO recipient
        capability: NFTCapability.minting,
        commitment: admin_pkh + "00".repeat(18) + "03E8",
        amount: 10000n,
        value: 800,                    // Satoshi value
    });
    const tokenId = genesisResponse.tokenIds![0]!;

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

    const oldLength =  contractUtxos.length

    // @ts-ignore
    await provider.performRequest(
        "blockchain.transaction.broadcast",
        transaction
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


test('test parsing NFTs', async t => {


    let contract_address = BadgerStake.getAddress();
    let watch = await Wallet.fromCashaddr(contract_address)
    let provider = watch.provider!
    // @ts-ignore
    let badgerUtxos = await provider.performRequest(
        "blockchain.address.listunspent",
        contract_address,
        "include_tokens"
    )
    let stakes = badgerUtxos.map( (u:UtxoI) => BadgerStake.parseNFT(u))
    t.assert(stakes.length>0)

});
