import { TestNetWallet, TokenSendRequest } from "mainnet-js";
import 'dotenv/config';

// Script used for airdropping block points (BPT)

const wif = process.env.WIF;
const tokenIdFungible = "ffc9d3b3488e890ef113b1c74f40e1f5eb1147a7d4191cecac89fd515721a271"
const destination = "bchtest:r0ak899wsk9mr9wz78tw2pnppumzry6ypejfvsad6u4vrj4kdewpwnunrf8g7"

if(!wif || !tokenIdFungible ) throw new Error("missing .env variables")

// Initialize wallet
const wallet = await TestNetWallet.fromWIF(wif);

// do airdrop
let requestList = Array(127).fill({
  cashaddr: destination,
  value: 800,
  tokenId: tokenIdFungible as string,
  amount: 72624976668147841n
} as TokenSendRequest) as TokenSendRequest[]

// console.log(requestList)
await wallet.send(requestList);