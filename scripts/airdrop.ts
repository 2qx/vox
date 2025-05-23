import { Wallet, TokenSendRequest } from "mainnet-js";
import 'dotenv/config';

// Script used for airdropping block points (BPT)

const wif = process.env.WIF;
const tokenIdFungible = "7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c"

if(!wif || !tokenIdFungible ) throw new Error("missing .env variables")

// Initialize wallet & check balance
const wallet = await Wallet.fromWIF(wif);
const walletAddress = wallet.getDepositAddress();
const balance = await wallet.getBalance();
const tokenBalance = await wallet.getTokenBalance(tokenIdFungible);
console.log(`wallet address: ${walletAddress}`);
if(typeof balance == "number" || !balance.sat) throw new Error("Error in wallet.getBalance()")
console.log(`Bch amount in walletAddress is ${balance.bch}bch or ${balance.sat}sats`);
if(balance.sat < 10_000) throw new Error("Wallet does not have enough BCH to start the airdrop!");

// Start airdrop
let requestList = Array(127).fill({
  cashaddr: "bitcoincash:r0ak899wsk9mr9wz78tw2pnppumzry6ypejfvsad6u4vrj4kdewpwsmza35av",
  value: 800,
  tokenId: tokenIdFungible as string,
  amount: 72624976668147841n
} as TokenSendRequest) as TokenSendRequest[]

// sends a separate transaction per address
async function airdropTokens(requestList: TokenSendRequest[]){
  //console.log(requestList)
  const { txId } = await wallet.send(requestList);
  console.log(txId);
}

// Start airdrop
await airdropTokens(requestList);