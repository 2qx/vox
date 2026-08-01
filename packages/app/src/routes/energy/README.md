# About Photons

Photon (PHOTON) is a solar punk meme token powering a decentralized energy oracle on Bitcoin Cash (BCH). It is a fairly distributed minable CashToken calculating its own transaction hash in BitcoinScript.

Anyone can monetize excess electricity hashing for photons. Photons are released from the vault when someone finds the hash of the transaction is below a certain difficulty threshold. Each release of tokens must also updates the hashing difficulty threshold. The difficulty *may* become correlated with the availability of excess free energy being absorbed by individuals globally. 

## Begin mining without sats

The Photon Vault keeps cash to facilitate payments to miners. Each payout has an allowance of 1500 sats, for the dust accompanying a miner's payout and the network fees for the transaction itself. 

## What is the PoW? 

The PoW algorithm for Photons Hash256(Schnorr(Sha256)). The double SHA-256 hash of a transaction (as calculated by the unlocking script). Additionally, the unlocking script requires a [Schnorr message signed (with OP_CHECKDATASIGV)](https://upgradespecs.bitcoincashnode.org/op_checkdatasig/) of the single SHA-256 has of a four-byte random nonce and the current difficulty target. 

## A decentralized energy oracle

Each miner taking tokens from the vault must update a dynamically changing difficulty value. The current *difficulty*, combined with the free market price of photos, creates a decentralized price oracle all miners contribute toward maintaining.

If someone has already found a payout in this block, the difficulty gets one percent harder. If people stop taking tokens, the difficulty get easier each block.

The vault contract also allows anyone to use the price baton for a fee (8000 sats). The price is intended to discourage resetting the oracle baton. 