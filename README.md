<img width=100px src="./static/vox.svg">

# vox.cash

A collection of small decentralized financial applications.



## Unspent v3 Protocol Records

Instances of vox contracts are can be stored on NFTs. The commitments (and token category) can be used to construct an instance of the contract.

| Protocol     | NFT Record Commitment                                 | Ct  | Description      |
| ------------ | ----------------------------------------------------- | --- | ---------------- |
| CatDex       | <"U3X">                                               | 🔵   | Limit-order DEX  |
| Drip         |                                                       |     | MEV faucet       |
| Dutch        | <"U3A"><0x\${recipient}>                              | 🔵   | Dutch Auction    |
| Flash        | <"U3F">                                               |     | Flash Loans      |
| Locktime     | <"U3L"><0x\${recipient}><\${locktime}>                | 🔵   | Timelocked Vault |
| SmallIndex   | <"U3R"><0x\${key}>                                    | 🔵   | Key-Value DB     |
| Subscription | <"U3S"><\${installment}><0x\${recipient}><\${period}> | 🔵   | Subscriptions    |
| Timeout      | <"U3T"><0x\${recipient}><\${timeout}>                 | 🔵   | Timeout Vault    |
| Trust        | <"U3P"><0x\${recipient}>                              |     | Annuity          |
| Vox          | <"U3V"><0x\${channel}>                                | 🔵   | Chat             |



## First-class Assets

Vox.cash will support a number 

| Protocol     | Identifier             | Ticker(s)         |
| ------------ | ---------------------- | ----------------- |
| Badgers      | -                      | BADGER            |
| Block Points | -                      | BPTS              |
| Bloc Tops    | -                      | BTOP              |
| Future BCH   | <"FBCH"><\${locktime}> | FBCH-`<locktime>` |
| Wrapped BCH  | -                      | WBCH              |


## Sub protocols

### Small Index

Any contract from any Unspent v3 protocol may be announced as a Small Index record. 

Records specific to a token may be announced in the index for that token category. 

General anyone-can-spend contract records may be announced in stores for that contract type. 

Small index records, if not intended for a virtual machine, should be prefixed with an operation code halting machine interpretation, i.e. OP_RETURN. 

All records must pay miners a rate of 1 sat/block. It is up to user software to assure records persist for long enough to accomplish their intended purpose. 

### Market Identifiers

CatDex is a market aggregator that may support many DEX protocols. 

Markets may be denoted on a small index or vox contract like so:

| Protocol      | Identifier                                             |
| ------------- | ------------------------------------------------------ |
| CatDex        | OP_RETURN <"U3X"> <liquidity_provider_pkh>             |
| Cauldron AMM  | OP_RETURN <"CQ1"> <liquidity_provider_pkh>             |
| Dutch Auction | OP_RETURN <"U3A"> <liquidity_provider_pkh>             |
| TapSwap Ask   | OP_RETURN <"TAP"> <liquidity_provider_pkh> <ask_price> |

If not otherwise provided, all fees and missing parameters are assumed to match the defaults for the related exchange. 

### Vox Chat

A Vox channel may be announced on a small index or in another vox channel with a vox record:

   OP_RETURN <"UV3"> <channel_name>

Vox is a protocol for rolling chat groups.

The following actions are available:

| Protocol | Identifier                        |
| -------- | --------------------------------- |
| message  | OP_RETURN <"V0"> <"a message">    |
| like     | OP_RETURN <"V+"> <transaction_id> |
| dislike  | OP_RETURN <"V-"> <transaction_id> |
| reply    | OP_RETURN <"VR"> <transaction_id> |

The above action templates may be sent to a Vox Channel as immutable NFT commitments of the author's NFT category. Message order is specified by the order of transaction outputs.

A post is comprised of message packets. All the message packets of one transaction shall be concatenated together (without spaces) and rendered as a single post. 

A reply or like may be followed by an unlimited messages, but MUST be specific to one proceeding message.