# About Photons

Photon tokens are solar punk themed fairly distributed minable CashToken creating a decentralized energy oracle. 

Anyone can utilize excess electricity hash to emit Photons (PHOTON). Photons are released from the vault when someone finds the hash of the transaction is below a certain difficulty threshold. 

## Begin mining without sats

The Photon Vault hold an output with a small amount of satoshis to facilitate payments to miners. Each payout has an allowance of 1200 sats, for the dust accompanying a miner's payout and the network fees for the transaction itself. 

## What is the PoW? 

The PoW algorithm for Photons Hash256(Schnorr(Sha256)). The double SHA-256 hash of a transaction (as calculated by the unlocking script). Additionally, the unlocking script requires a [Schnorr message signed (with OP_CHECKDATASIGV)](https://upgradespecs.bitcoincashnode.org/op_checkdatasig/) of the single SHA-256 has of a four-byte random nonce and the current difficulty target. 

## A decentralized energy oracle

Each miner taking tokens from the vault must update a dynamically changing difficulty value. The current *difficulty*, combined with the free market price of photos, creates a decentralized price oracle all miners contribute toward maintaining.

The vault contract also allows anyone to use the price baton for a fee (8000 sats). 
