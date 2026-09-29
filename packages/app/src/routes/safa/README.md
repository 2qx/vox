SAFAs - A sha256 ASIC minable automated token market

## Overview

The goal of SAFAs is to establish a three-way market between energy, cash and a floating native token. 

The vault contract combines 1) a sha256 minable token with 2) a automatic market both for initial issuance and to create 3) a pool of deep cash liquidity. 

## Definitions 
 
For clarity, a distinction is made below between traditional full block *miners* and token *grinders*. 

*Miners:* maintain the network by creating full blocks of batched transactions. In 2026, they are Sha256 ASIC users that secure the network by decentralizing block creation and are paid in a block rewards from a perpetual annuity established in consensus protocols.

*Grinders:* token miners grinding for a SAFA NFT commitment hash, that may use identical ASIC hardware or switch between SAFAs and BTC/BCH mining. They maintain a decentralized difficulty oracle and help establish a new cash market for energy fire-walled from the influence of fiat tokens.

If these definitions are useful, folks can adopt them into their vocabulary to carry the distinction forward. 

# Grinding Spending Path

The *grinding* spending path allows releasing tokens if the hash of the next NFT baton is below the target threshold. 

## Emission

Winning nonces allow withdraw of 1/420,000th of the token balance, targeting a 210,000 block half-life. 

To facilitate onboarding of new users, an allowance for transaction fees provided from the thread cash balance.

Winning grinders MUST withdraw their whole reward as tokens, and cannot the utilize exchange in the same spending thread. 

## Grinding Baton 

Each thread of the SAFA vault consists of a UTXO with a mutable NFT baton, tokens and satoshis. 

The contents of the NFT commitment are directly analogous to a standard bitcoin block header:


 | field | length | description | 
 | :-    |:-  |:-         | 
 |  virtual  | 4 bytes | Scalar for initial thread balance. |
| previous NFT commitment hash  | 32 bytes | The double sha256 hash of the previous commitment. |
| payout locking bytecode hash | 32 bytes | The double sha256 hash of the grinder's locking script. |
| timestamp | 4 bytes  | A unix epoch timestamp |
| target | 4 bytes  | Current difficulty target in [compressed target format](https://reference.cash/protocol/blockchain/block/block-header#compressed-target-format) |
| nonce | 4 bytes | Random bytes

A wining nonce is a commitment where the double sha256 hash of the 80-byte NFT commitment falls below the target threshold. 

Note, the antecedent input hash and index is **missing**, but the grinder's address is included. The baton may be passed in many other transactions (oracle/exchange) while a grinder is working without interrupting their efforts. 

## Difficulty Adjustment Algorithm  

A simple incremental moving average DAA like that used for [photons](https://bitcoincashresearch.org/t/block-tops-btop-a-minable-cashtoken/) can be modified to support the same overall transaction rate targeting (one transaction per block), but for multiple thread by simply dividing the age parameter by the thread count.

    NextTarget = ( PrevTarget * (143 + age/<thread_count>) ) / 144

The difficulty for each thread is expected to produce wins about once every <thread_count> blocks. And the net rate of all threads would average about once per block. 

# Market Spending Path

The vault contains a spending path creating a decentralized market for issuance or/and exchange of tokens and cash. 

## Direct Issuance Constant Product Market


Automated Constant Product Market Maker (CPMM) algorithms [like Cauldron](https://www.cauldron.quest/_files/ugd/ae85be_b1dc04d2b6b94ab5a200e3d8cd197aa3.pdf) provide a very succinct mechanism to provide liquidity over a very wide range of prices using a constant product formula:

    K  = t * s

Where *K* is a constant and *t* and *v* represent the quantities of tokens and satoshis, respectively.

For an issuing vault, a CPMM could be created to provide direct market liquidity by bypassing problematic edge behavior of constant product markets with a virual  .

where: 

    K = t * s'

Where *s'* is the thread cash balance plus an initial starting 'virtual' balance. 

   s' = s + s<sub>virtual</sub>

In a multi-threaded context, the *s'* can be stored on a thread baton to be proportional to the token balance. 

# System Considerations

Below are features of the contract as an overall system. 

## Transaction Shapes

Threads are expected to be used with two shapes.

- A trade follows a parallel thread [in==out].
- A payout thread follows a [[1-in,2-out batched form]](https://bitcoincashresearch.org/t/exploit-and-solutions-for-calculated-outputs/1423/5)

Since payout threads originate from an anyone-can-spend source, releasing treads may be composed by block miners. 

In a naive, or traditional setting, a winning grinder will compose a transaction returning the NFT baton in the first output and paying themselves in the second output. However, it will be theoretically possible for block miners to earn a few extra satoshis on transaction overhead by batching all the winning grinds per block. 

Traders may arbitrage vault threads (with cauldron AMM threads) by combining many parallel micro threads in a transaction. 

The bytecode for vault AMM threads will be considerably larger than Cauldron V1 MM threads, however, vault threads will have the advantage of being commission free, which may be advantageous for larger trades.

## Grinder Subsidy 

The DEX spending path is commission free but not entirely 'free'. Since grinders are allowed to withdraw enough cash to cover dust and transaction fees, the market is subsidizing the release of new tokens. 

However, in the long run, grinders take cash subsidies into consideration when grinding and selling tokens, so the subsidy is returned in the market. 

## Thread Allocation

Early adopters traded energy and sha256 hash power as an unpermissioned mechanism to onboard themselves to the network.

Recently, projects like [HAN](https://github.com/valerio-vaccaro/HAN) and [nerdminer](https://github.com/BitMaker-hub/NerdMiner_v2) give users the feeling they are contributing to the security of networks with tiny embedded computers like the ESP32. There are special pools to accommodate these special hash rate shares. 

For a token contract, many smaller grinders can be accommodated with many smaller threads. Threads with lower payouts, a constant transaction overhead, and potential higher proportional difficulty may disincentivize large grinders.

Below is one potential distribution of 21M tokens across 71 threads, where each thread would payout about once every 12 hours.

| threads | tokens |  subtotal| |
| :-: | -: | -:| -:|
| 1 | 7M |  7M||
| 7 | 1M |  7M ||
| 13 | 500k | 6.5M ||  
| 50 | 10k | 0.5M||
| *71* | | *21M* | **total** | 

In the example above, where the large thread is 700 times larger than the smaller thread, small grinders can raise the relative difficulty of small payout threads to disincentivize large grinders from attempting that work. 

The relative difficulty, proportional to the payout, may be several orders of magnitude higher than for larger threads, which can drive away large miners from small threads.

Nonces for threads with identical parameters MUST be randomized at initialization to prevent flash grinders from using winning nonces on batches of threads.

To initialize the automated market maker at a floor price of 1000 satoshis, a scaler for the virtual balance may be stored in the 'version' field of the header baton. 

The initial balance (in satoshis) calculated in the contract by multiplying the scaler by 1,000,000.

| thread |  s<sub>virtual</sub>   | scaler | 
| -:   | -:|  -: |
| 7M   | 70 coins  | `46000000` |
| 1M   | 10 coins  | `0a000000` |
| 500k | 5 coins   | `05000000` |  
| 10k  | 0.1 coins     | `01000000` |




## The Oracle Usecase

A common pattern for financial contracts to establish a definition (price/event) that determines some later outcome. In the case of some future asset price, specific definitions of rates at specific exchanges are often used as an equivalent approximation of free and fair market values. 

While an oracle can provide a mechanism to unlock liquidity or incentivize market stabilization, there are more direct ways to achieve fair trade based on the direct exchange of assets.

In short, a real market trumps a cash swap using a reported ticker. If people, agents, or other contracts have uninterrupted access to a fair market for exchange, they can set the fair market price directly through trade without reliance on a purported price. 

That said, it should still be possible to aggregate a normalized difficulty across all threads, to create an implicit price oracle like overall chain difficulty. A simpler method would be to utilize the largest thread baton in another contract by enforcing the initial supply in the NFT baton and token category. 

Utilizing the exchange spending pathway (without changing balances) allows use of a single thread as an oracle baton. 