import { TestNetWallet, TokenSendRequest } from "mainnet-js";

// Script used for airdropping block points (BPT)

const wif = process.env.WIF;
const tokenIdFungible = "10608586e070bbea7142435775f79161751972f180f64752bae974dbe023ebc3"
const destination = "bchtest:rvlnj38vup2zgng7dg0jqz8cx6up9ucrdde3tejs2vx2ycxjmm5nc4t57weye"

if (!wif || !tokenIdFungible) throw new Error("missing .env variables")

// Initialize wallet
const wallet = await TestNetWallet.fromWIF(wif);

// do airdrop
let requestList = Array(127).fill({
  cashaddr: destination,
  value: 800n,
  category: tokenIdFungible as string,
  amount: 72624976668147841n
} as TokenSendRequest) as TokenSendRequest[]

// console.log(requestList)
await wallet.send(requestList);