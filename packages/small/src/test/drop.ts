import test from 'ava';
import { hexToBin } from "@bitauth/libauth";
// @ts-ignore
import getAnAliceWallet from "../../../../scripts/aliceWallet.js";
import { RegTestWallet, mine, NFTCapability, TokenMintRequest, } from "mainnet-js";
import { sleep } from "@unspent/tau";
import SmallIndex from "../index.js";


test.skip('test dropping function with index key', async t => {

    const alice = await getAnAliceWallet(100_003_000)
    let provider = alice.provider!

    let contract_address = SmallIndex.getAddress("test", "bchreg")
    const genesisResponse = await alice.tokenGenesis({
        cashaddr: alice.getDepositAddress(), // token UTXO recipient
        capability: NFTCapability.minting,
        value: 800,                    // Satoshi value
    });
    const tokenId = genesisResponse.tokenIds![0]!;


    await alice.tokenMint(
        tokenId,
        [
            new TokenMintRequest({
                cashaddr: contract_address,
                commitment: "Hello World",
                capability: NFTCapability.none,
                value: 800,
            })
        ]
    );




    await mine({
        /* cspell:disable-next-line */
        cashaddr: "bchreg:ppt0dzpt8xmt9h2apv9r60cydmy9k0jkfg4atpnp2f",
        blocks: 801,
    });


    // @ts-ignore
    let contractUtxos = await provider.performRequest(
        "blockchain.address.listunspent",
        contract_address,
        "include_tokens"
    )


    let currentHeight = await provider.getBlockHeight()
    contractUtxos = contractUtxos.filter((u: any) => u.height + u.value < currentHeight)
    
    let transaction = SmallIndex.drop("test", contractUtxos[0])

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
