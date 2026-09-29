import { Wallet, TokenSendRequest } from "mainnet-js";

// Script used for airdropping block points (BPT)

const wif = process.env.WIF;
const tokenIdFungible = "c7ea26912c147b521ad956cf64461d844c3239d382ac6f7072dc43725247dc76"
const destination = "bitcoincash:rvlnj38vup2zgng7dg0jqz8cx6up9ucrdde3tejs2vx2ycxjmm5nckv9qk23t"

if(!wif || !tokenIdFungible ) throw new Error("missing .env variables")

// Initialize wallet
const wallet = await Wallet.fromWIF(wif);

// do airdrop
let requestList = Array(337).fill({
  cashaddr: destination,
  value: 800n,
  category: tokenIdFungible as string,
  amount: 27369056489183310n
} as TokenSendRequest) as TokenSendRequest[]

// console.log(requestList)
await wallet.send(requestList);