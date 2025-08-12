<img width=100px src="./static/vox.svg">

# vox.cash

A collection of small decentralized financial applications.


## First-class Assets

| Protocol    | Identifier | Ticker(s)         |
| ----------- | ---------- | ----------------- |
| Badgers     | -          | BADGER            |
| BlockPoints | -          | BPT               |
| Future BCH  | <"FBCH">   | FBCH-`[locktime]` |
| Wrapped BCH | -          | WBCH              |

## Unspent v3 Protocols

| Protocol     | Identifier | Ct  | Description                               |
| ------------ | ---------- | --- | ----------------------------------------- |
| CatDex       | <"U3X">    | 🔵   | Limit-order DEX                           |
| Drip         |            |     | Miner extractable value fidget spinner    |
| Dutch        | <"U3A">    | 🔵   | Dutch Auction                             |
| Flash        | <"U3F">    |     | Flash Loans                               |
| Locktime     | <"U3L">    | 🔵   | Hodl-style lock                           |
| SmallIndex   | <"U3R">    | 🔵   | Key-Value Database                        |
| Subscription | <"U3S">    | 🔵   | Token-denominated revocable subscriptions |
| Timeout      | <"U3T">    | 🔵   | A last-will style timeout                 |
| Trust        | <"U3P">    |     | Irrevocable perpetuity                    |
| Vox          | <"U3V">    | 🔵   | Chat Channel                              |



## Sub protocols

### Small Index

Any contract from any Unspent v3 protocol may be announced as a Small Index record. 

Records specific to a token may be announced in the index for that token category. 

General anyone-can-spend contract records may be announced in stores for that contract type. 

Small index records, if not intended for a virtual machine, should be prefixed with an operation code halting machine interpretation, i.e. OP_RETURN. 

All records must pay miners a rate of 1 sat/block. It is up to user software to assure records persist for long enough to accomplish their intended purpose. 

### Vox 

A Vox channel may be announced on a small index or in another vox channel with a vox record:

   OP_RETURN <"UV3"> <channel_name>

Vox is a protocol for rolling chat groups.

The following actions are available:

| Protocol | Identifier                        |
| -------- | --------------------------------- |
| message  | OP_RETURN <"V0"> <"a message">    |
| like     | OP_RETURN <"V+"> <transaction_id> |
| reply    | OP_RETURN <"VR"> <transaction_id> |

The above action templates may be sent to a Vox Channel as immutable NFT commitments of the author's NFT category. Message order is specified by the order of transaction outputs.

A post is comprised of message packets. All the message packets of one transaction shall be concatenated together (without spaces) and rendered as a single post. 

A reply or like may be followed by an unlimited messages, but MUST be specific to one proceeding message.


### External Market Identifiers

External markets may be denoted on a tokens small or vox contract like so:

| Protocol     | Identifier                                              |
| ------------ | ------------------------------------------------------- |
| TapSwap Ask  | OP_RETURN <"TAP"> <liquidity_provider_pkh> \<ask_price> |
| Cauldron AMM | OP_RETURN <"CQ1"> \<liquidity_provider_pkh>             |

If not otherwise provided, all fees and missing parameters are assumed to match the defaults for the related exchange. 