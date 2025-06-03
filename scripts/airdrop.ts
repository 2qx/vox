import { Wallet, TokenSendRequest } from "mainnet-js";
import 'dotenv/config';

// Script used for airdropping block points (BPT)

const wif = process.env.WIF;
const tokenIdFungible = "7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c"
const destination = "bitcoincash:r0ak899wsk9mr9wz78tw2pnppumzry6ypejfvsad6u4vrj4kdewpwsmza35av"

if(!wif || !tokenIdFungible ) throw new Error("missing .env variables")

// Initialize wallet
const wallet = await Wallet.fromWIF(wif);

// do airdrop
let requestList = Array(127).fill({
  cashaddr: destination,
  value: 800,
  tokenId: tokenIdFungible as string,
  amount: 72624976668147841n
} as TokenSendRequest) as TokenSendRequest[]

// console.log(requestList)
await wallet.send(requestList);