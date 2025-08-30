import { TestNetWallet } from "mainnet-js";

//const wif = process.env.WIF;
const wif = "<YOUR_ADDRESS_WIF>"

// Initialize wallet
const wallet = await TestNetWallet.fromWIF(wif);
await wallet.sendMax("<YOUR_DESTINATINON_ADDRESS>");
console.log("done")