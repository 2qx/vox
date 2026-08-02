# About Photons

Photon (PHOTON) is a solar punk meme token powering a decentralized energy oracle on Bitcoin Cash (BCH). It is a fairly distributed minable CashToken calculating its own transaction hash in BitcoinScript.

Anyone can monetize their excess electricity by hashing for photons. Photons are released from the vault when someone finds the hash of the transaction is below a certain difficulty threshold. Each release of tokens must also update the hashing difficulty threshold. The difficulty *may* become correlated with the availability of excess free energy being absorbed by individuals globally. 

## Begin mining without sats

The Photon Vault keeps a cash balance to facilitate payments to miners. Each payout has an allowance of 1500 sats, for the dust accompanying a miner's payout and the network fees for the transaction itself. 

## What is the PoW? 

The PoW algorithm for Photons is Hash256(Secp256k1(Sha256)). Specifically, each transaction taking photons from the vault must return the mutable NFT baton with the following data updated:

| Data                                                             | Size                     |
| :--------------------------------------------------------------- | :----------------------- |
| nonce                                                            | 4-bytes                  |
| next target                                                      | 32-bytes (Little Endian) |
| Schnorr signature of sha256(nonce + next target) | 64-bytes                 |

When included in a transaction, satisfying a number of other requirements, if the double sha256 hash of the resulting transaction is less than the next target, the unlocking script for the photon vault can release a reward. 

## A decentralized energy oracle

Each miner taking tokens from the vault must update a dynamically changing difficulty value. The current *difficulty*, combined with the free market price of photons, creates a decentralized price oracle all miners contribute toward maintaining.

If someone has already found a payout in this block, the difficulty gets one percent harder. If people stop taking tokens, the difficulty get easier each block.

The vault contract also allows anyone to use the price baton for a fee (8000 sats). The price is intended to discourage resetting the oracle baton. 

## A simple Difficulty Adjustment Algorithm (DAA)

The target frequency for the price oracle is one update per block. 

The price oracle can be updated multiple times per block, but this makes mining 0.7% harder. If no reward is found in a block it gets 0.7% easier with each block. Mining becomes roughly 100% easier per day the oracle is not updated.

The equation is a function of the baton transaction age (in block) and the previous difficulty target.

    NextTarget = ( PrevTarget * (143 + age) ) / 144

The NextTarget MUST match the exact value given by the DAA, it may not be arbitrarily lowered by any miner.