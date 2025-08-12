import { TestNetWallet, TokenSendRequest } from "mainnet-js";
import 'dotenv/config';

// Script used for airdropping block points (BPT)

const wif = process.env.WIF;
const tokenIdFungible = "bb61cd7a6c8a3a3742d965dc7ac73c1117382a5c8930b68338deb881f75c0214"
const destination = "bchtest:r0ujgnc9jnyurzv99678fgac3fdrq8x3py9rlrg6dlnz96qxrdl02gar8wz9u"

if(!wif || !tokenIdFungible ) throw new Error("missing .env variables")

// Initialize wallet
const wallet = await TestNetWallet.fromWIF(wif);

// do airdrop
let requestList = Array(7).fill({
  cashaddr: destination,
  value: 800,
  tokenId: tokenIdFungible as string,
  amount: 300000000000000n
} as TokenSendRequest) as TokenSendRequest[]

// console.log(requestList)
await wallet.send(requestList);