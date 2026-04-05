import { Wallet, TokenSendRequest } from "mainnet-js";
import 'dotenv/config';

// Script used for airdropping block points (BPT)

const wif = process.env.WIF;
const tokenIdFungible = "7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c"
const destination = "bitcoincash:r06fp2k6ux4c6dq8dpafmmpapq9julzfpk04k5309zhmu2vw20mh7srlt9cr9"

if(!wif || !tokenIdFungible ) throw new Error("missing .env variables")

// Initialize wallet
const wallet = await Wallet.fromWIF(wif);

// do airdrop
let requestList = Array(127).fill({
  cashaddr: destination,
  value: 800,
  tokenId: tokenIdFungible as string,
  amount: 72624976668144699n
} as TokenSendRequest) as TokenSendRequest[]

// console.log(requestList)
await wallet.send(requestList);