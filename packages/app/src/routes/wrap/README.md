# About Wrapped BCH

Wrapped Bitcoin Cash (WBCH) are fungible CashTokens redeemable 1:1 for Bitcoin Cash. 

Wrapped BCH (WBCH) [[wrapped.cash]](https://wrapped.cash) was created by Dagur Valberg Johannsson in [November 2023](https://bitcoincashresearch.org/t/wbch-bch-wrapped-as-cash-token/1196). 

All 21M WBCH minted were sent to an immutable vault contract as 21 outputs, each with 1M WBCH. 

The Wrapped BCH contract enforces three conditions:

 1. The token id MUST not change.
 1. An output being spent from the contract MUST return to the contract.
 1. The sum of tokens and sats *in* MUST equal the sum of tokens and satoshis *out*.

These three rules ensure that when tokens are spent from the contract, each must swap an equal amount of Bitcoin Cash in a corresponding output.

Notice how WBCH token category (id) isn't in the contract rules? That's right. The contract will enforce a 1:1 peg with any token, not just "official" WBCH tokens.

Anyone may send any fungible token to the contract, but that doesn't make it WBCH. So there is one more **important** condition needed to make the Wrapped BCH fair.  Dagur minted a fungible token with 21M tokens (8 decimals) and sent the entire supply to the vault contract. 

To **verify** that WBCH is fair, we can lookup the pre-genesis transaction:

[ff4d6e4b90aa8158d39c5dc874fd9411af1ac3b5ed6f354755e8362a0d02c6b3](https://explorer.salemkode.com/tx/ff4d6e4b90aa8158d39c5dc874fd9411af1ac3b5ed6f354755e8362a0d02c6b3)


... the first output was the coin used to mint all WBCH tokens. 



The minting transaction was in the next transaction:

[110dc94c0aa1a4c60ff4738eeee7f931d8f11086190281f43cf3330419d918c8](https://explorer.salemkode.com/tx/110dc94c0aa1a4c60ff4738eeee7f931d8f11086190281f43cf3330419d918c8)

The minting transaction created one wrapped satoshi for every bitcoin (cash) satoshi. 

Given the total minted supply of 21 WBCH sats, we do NOT need to do forensic blockchain analysis or prove a chain of custody of each token from genesis to the WBCH vault, we can just check that the total balance of WBCH on the vault is equal to the total supply of the fungible token, minus BCH locked on WBCH outputs. 