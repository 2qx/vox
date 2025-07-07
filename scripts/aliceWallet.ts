import { RegTestWallet } from "mainnet-js";



export default async function getAnAliceWallet(amount: number): Promise<RegTestWallet> {
  const alice = await RegTestWallet.fromId(process.env["ALICE_ID"]!);
  const height = await alice.provider!.getBlockHeight();
  let utxos = await alice.getUtxos();
  utxos = utxos.filter((u:any) => (height - u.height!) > 100)

  let randomUtxo = utxos[Math.floor(Math.random() * utxos.length)]
  let newAlice = await RegTestWallet.newRandom();
  await alice.send([
    {
      cashaddr: newAlice.getDepositAddress(),
      value: amount,
      unit: "satoshis",
    },
  ], {
    utxoIds: [randomUtxo!]
  });
  return newAlice
}
