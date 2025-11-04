import{f as c,a as s}from"../chunks/DYbKDSXk.js";import{au as p,p as y,a as m,c as d,s as l,r as u,t as h}from"../chunks/DlUVEpaU.js";import{i as g}from"../chunks/C6jlbT71.js";import{s as k}from"../chunks/vpaS6ag4.js";import"../chunks/vmZ8CxnS.js";import{B as O,D as P}from"../chunks/DpKBRRcz.js";import{k as x,l as v,m as T,o as B}from"../chunks/DLngWCRZ.js";import{c as E}from"../chunks/BP7KE8cK.js";const S=!0,J=Object.freeze(Object.defineProperty({__proto__:null,prerender:S},Symbol.toStringTag,{value:"Module"}));var I=c('<h3>About CatDex</h3> <p>Category Decentralized Exchange is a protocol to exchange assets using orders stored on non-fungible token commitments.</p> <p>More information about <a href="https://bitcoincashresearch.org/t/catdex-a-token-category-authorized-decentralized-exchange/1480" rel="nofollow">the contract.</a></p>',1);function w(a){var e=I();p(4),s(a,e)}const A="https://libauth.org/schemas/wallet-template-v0.schema.json",C="CatDex: a limit order CashToken exchange.",U="CatDex",N={covenant:{description:"A blackboard lists limit orders and authorizes trade for a Category Decentralized Exchange.",name:"CatDex Blackboard",scripts:["sell","buy","catdex_blackboard","administer"],variables:{auth_category:{description:"Stake amount.",name:"Authentication Token Category",type:"WalletData"},asset_category:{description:"The CashToken Category Token ID of the asset being traded",name:"Asset Token Category",type:"WalletData"},key:{description:"The private key that controls this wallet.",name:"Key",type:"HdKey"}}}},D=JSON.parse('{"base":{"data":{"bytecode":{"auth_category":"0xefbe00000000000000000000000000000000000000000000000000000000efbe","asset_category":"0x2c06f3b2565d0818a8e41f58beff5918d5dbdc64b11ee8ad474e499751cde07f"}},"description":"","name":"Base Scenario"},"excise_sell_order_baton":{"description":"Buy using a sell order.","extends":"base","name":"Use sell order (baton tread)","transaction":{"inputs":[{"unlockingBytecode":["slot"]},{},{"unlockingBytecode":{"script":"wallet_unlock"}}],"outputs":[{"lockingBytecode":{"script":"catdex_blackboard"},"valueSatoshis":10400,"token":{"category":"beef00000000000000000000000000000000000000000000000000000000beef","nft":{"capability":"mutable","commitment":"0000000000000000000000000000000000943577000000000000000000000000"}}},{"lockingBytecode":{"script":"catdex_blackboard"},"valueSatoshis":800,"token":{"amount":0,"category":"7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c"}},{"lockingBytecode":{"script":"wallet_lock"},"valueSatoshis":9600,"token":{"amount":20,"category":"7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c"}}],"version":2},"sourceOutputs":[{"lockingBytecode":["slot"],"valueSatoshis":10000,"token":{"category":"beef00000000000000000000000000000000000000000000000000000000beef","nft":{"commitment":"1400000000000000000000000000008000943577000000000000000000000000","capability":"mutable"}}},{"valueSatoshis":800,"token":{"category":"7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c","amount":20}},{"lockingBytecode":{"script":"wallet_lock"},"valueSatoshis":10000}]},"excise_sell_order_asset":{"description":"Test buying an asset using a sell order.","extends":"base","name":"Use sell order to buy (asset tread)","transaction":{"inputs":[{},{"unlockingBytecode":["slot"]},{"unlockingBytecode":{"script":"wallet_unlock"}}],"outputs":[{"lockingBytecode":{"script":"catdex_blackboard"},"valueSatoshis":10400,"token":{"category":"beef00000000000000000000000000000000000000000000000000000000beef","nft":{"capability":"mutable","commitment":"0000000000000000000000000000000000943577000000000000000000000000"}}},{"lockingBytecode":{"script":"catdex_blackboard"},"valueSatoshis":800,"token":{"amount":0,"category":"7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c"}},{"lockingBytecode":{"script":"wallet_lock"},"valueSatoshis":9600,"token":{"amount":20,"category":"7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c"}}],"version":2},"sourceOutputs":[{"valueSatoshis":10000,"token":{"category":"beef00000000000000000000000000000000000000000000000000000000beef","nft":{"commitment":"1400000000000000000000000000008000943577000000000000000000000000","capability":"mutable"}}},{"lockingBytecode":["slot"],"valueSatoshis":800,"token":{"category":"7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c","amount":20}},{"lockingBytecode":{"script":"wallet_lock"},"valueSatoshis":10000}]},"overbuy_order_baton":{"description":"Test that overbuying a sell order should fail.","extends":"base","name":"FAIL: overbuy sell order (baton tread)","transaction":{"inputs":[{"unlockingBytecode":["slot"]},{},{"unlockingBytecode":{"script":"wallet_unlock"}}],"outputs":[{"lockingBytecode":{"script":"catdex_blackboard"},"valueSatoshis":10800,"token":{"category":"beef00000000000000000000000000000000000000000000000000000000beef","nft":{"capability":"mutable","commitment":"1400000000000000000000000000000000943577000000000000000000000000"}}},{"lockingBytecode":{"script":"catdex_blackboard"},"valueSatoshis":800,"token":{"amount":0,"category":"7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c"}},{"lockingBytecode":{"script":"wallet_lock"},"valueSatoshis":9200,"token":{"amount":40,"category":"7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c"}}],"version":2},"sourceOutputs":[{"lockingBytecode":["slot"],"valueSatoshis":10000,"token":{"category":"beef00000000000000000000000000000000000000000000000000000000beef","nft":{"commitment":"1400000000000000000000000000008000943577000000000000000000000000","capability":"mutable"}}},{"valueSatoshis":800,"token":{"category":"7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c","amount":40}},{"lockingBytecode":{"script":"wallet_lock"},"valueSatoshis":10000}]},"overbuy_order_asset":{"description":"Test that overbuying a sell order should fail.","extends":"base","name":"FAIL: overbuy sell order (asset tread)","transaction":{"inputs":[{},{"unlockingBytecode":["slot"]},{"unlockingBytecode":{"script":"wallet_unlock"}}],"outputs":[{"lockingBytecode":{"script":"catdex_blackboard"},"valueSatoshis":10800,"token":{"category":"beef00000000000000000000000000000000000000000000000000000000beef","nft":{"capability":"mutable","commitment":"1400000000000000000000000000000000943577000000000000000000000000"}}},{"lockingBytecode":{"script":"catdex_blackboard"},"valueSatoshis":800,"token":{"amount":0,"category":"7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c"}},{"lockingBytecode":{"script":"wallet_lock"},"valueSatoshis":9200,"token":{"amount":40,"category":"7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c"}}],"version":2},"sourceOutputs":[{"valueSatoshis":10000,"token":{"category":"beef00000000000000000000000000000000000000000000000000000000beef","nft":{"commitment":"1400000000000000000000000000008000943577000000000000000000000000","capability":"mutable"}}},{"lockingBytecode":["slot"],"valueSatoshis":800,"token":{"category":"7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c","amount":40}},{"lockingBytecode":{"script":"wallet_lock"},"valueSatoshis":10000}]},"misexcise_sell_order_asset":{"description":"Test that selling to a sell order should fail.","extends":"base","name":"FAIL: selling into sell order (asset tread)","transaction":{"inputs":[{},{"unlockingBytecode":["slot"]},{"unlockingBytecode":{"script":"wallet_unlock"}}],"outputs":[{"lockingBytecode":{"script":"catdex_blackboard"},"valueSatoshis":10800,"token":{"category":"beef00000000000000000000000000000000000000000000000000000000beef","nft":{"capability":"mutable","commitment":"3c00000000000000000000000000008000943577000000000000000000000000"}}},{"lockingBytecode":{"script":"catdex_blackboard"},"valueSatoshis":800,"token":{"amount":60,"category":"7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c"}},{"lockingBytecode":{"script":"wallet_lock"},"valueSatoshis":10800}],"version":2},"sourceOutputs":[{"valueSatoshis":10000,"token":{"category":"beef00000000000000000000000000000000000000000000000000000000beef","nft":{"commitment":"1400000000000000000000000000008000943577000000000000000000000000","capability":"mutable"}}},{"lockingBytecode":["slot"],"valueSatoshis":800,"token":{"category":"7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c","amount":20}},{"lockingBytecode":{"script":"wallet_lock"},"valueSatoshis":10000,"token":{"category":"7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c","amount":40}}]},"excise_buy_order_baton":{"description":"Test selling an asset using a buy order.","extends":"base","name":"Use buy order to sell tokens","transaction":{"inputs":[{"unlockingBytecode":["slot"]},{},{"unlockingBytecode":{"script":"wallet_unlock"}}],"outputs":[{"lockingBytecode":{"script":"catdex_blackboard"},"valueSatoshis":10000,"token":{"category":"beef00000000000000000000000000000000000000000000000000000000beef","nft":{"capability":"mutable","commitment":"0000000000000000000000000000000000943577000000000000000000000000"}}},{"lockingBytecode":{"script":"catdex_blackboard"},"valueSatoshis":800,"token":{"amount":20,"category":"7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c"}},{"lockingBytecode":{"script":"wallet_lock"},"valueSatoshis":10400}],"version":2},"sourceOutputs":[{"lockingBytecode":["slot"],"valueSatoshis":10400,"token":{"category":"beef00000000000000000000000000000000000000000000000000000000beef","nft":{"commitment":"1400000000000000000000000000000000943577000000000000000000000000","capability":"mutable"}}},{"valueSatoshis":800,"token":{"category":"7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c","amount":0}},{"lockingBytecode":{"script":"wallet_lock"},"valueSatoshis":10000,"token":{"category":"7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c","amount":20}}]},"excise_buy_order_asset":{"description":"Test selling an asset to a buy order.","extends":"base","name":"Use buy order to sell tokens","transaction":{"inputs":[{},{"unlockingBytecode":["slot"]},{"unlockingBytecode":{"script":"wallet_unlock"}}],"outputs":[{"lockingBytecode":{"script":"catdex_blackboard"},"valueSatoshis":10000,"token":{"category":"beef00000000000000000000000000000000000000000000000000000000beef","nft":{"capability":"mutable","commitment":"0000000000000000000000000000000000943577000000000000000000000000"}}},{"lockingBytecode":{"script":"catdex_blackboard"},"valueSatoshis":800,"token":{"amount":20,"category":"7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c"}},{"lockingBytecode":{"script":"wallet_lock"},"valueSatoshis":10400}],"version":2},"sourceOutputs":[{"valueSatoshis":10400,"token":{"category":"beef00000000000000000000000000000000000000000000000000000000beef","nft":{"commitment":"1400000000000000000000000000000000943577000000000000000000000000","capability":"mutable"}}},{"lockingBytecode":["slot"],"valueSatoshis":800,"token":{"category":"7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c","amount":0}},{"lockingBytecode":{"script":"wallet_lock"},"valueSatoshis":10000,"token":{"category":"7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c","amount":20}}]},"withdraw":{"description":"Withdraw accumulated principal and tokens","extends":"base","name":"Withdraw","transaction":{"inputs":[{"unlockingBytecode":{"script":"wallet_unlock"}},{"unlockingBytecode":["slot"]}],"outputs":[{"lockingBytecode":{"script":"wallet_lock"},"valueSatoshis":800,"token":{"category":"beef00000000000000000000000000000000000000000000000000000000beef","nft":{"capability":"minting"}}},{"lockingBytecode":{"script":"wallet_lock"},"valueSatoshis":100000000,"token":{"category":"7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c","amount":100000000}}],"version":2},"sourceOutputs":[{"lockingBytecode":{"script":"wallet_lock"},"valueSatoshis":800,"token":{"category":"beef00000000000000000000000000000000000000000000000000000000beef","nft":{"capability":"minting"}}},{"lockingBytecode":["slot"],"valueSatoshis":100000000,"token":{"category":"7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c","amount":100000000}}]}}'),R={sell:{passes:["excise_buy_order_baton","excise_buy_order_asset"],name:"Sell assets",script:"",unlocks:"catdex_blackboard"},buy:{passes:["excise_sell_order_baton","excise_sell_order_asset"],fails:["overbuy_order_baton","overbuy_order_asset","misexcise_sell_order_asset"],name:"Buy assets",script:"",unlocks:"catdex_blackboard"},administer:{passes:["withdraw"],name:"Administer",script:"",unlocks:"catdex_blackboard"},wallet_unlock:{name:"Wallet Unlock",script:"<key.schnorr_signature.all_outputs> <key.public_key>",unlocks:"wallet_lock"},wallet_lock:{lockingType:"standard",name:"P2PKH Lock",script:`OP_DUP
OP_HASH160 <$(<key.public_key> OP_HASH160
)> OP_EQUALVERIFY
OP_CHECKSIG`},catdex_blackboard:{lockingType:"p2sh32",name:"CatDex Blackboard",script:`// pragma cashscript ^0.10.0;

//
// CatDex - A token category authorized decentralized exchange
//
// Trade fungible tokens at fixed prices based on orders expressed in NFT commitments

//   Features:
//   - Allow for partial order fulfillment at a fixed price,
//   - Allow contracts with zero (0) of a specific token to acquire a position in that token
//   - Allow contracts with some number of tokens to liquidate that position completely
//   - Allow a minting Baton holder to withdraw, or cancel any open order, by spending/burning utxos.
//   - Zero commission trades, although order takers pay standard transaction fees to miners.
//   - Given a known token category, orders are discoverable with the exchange token category.
//   - Given an exchange category, orders are indexed and retrieved by getting the NFT balance of the exchange.

// Usage:

//   The exchange "owner" creates an NFT category with a minting baton to open trade orders on their own behalf.

//   An order to Bid, or Buy, an asset is created by:
//    creating a mutable NFT with the order in the commitment
//    where the order quantity to be bought is *positive*, and
//    the output contains sufficient value to fulfill the entire order,
//    then sending that output to the dex contract.

//   An Ask order, or Sell, is created as above:
//     creating a mutable NFT identical to a buy, where,
//     the quantity available for sale is *negative*,
//     and the order utxo will accumulate any funds from the sale of the token,
//     after the owner sends both: the order and the tokens to the contract as two utxos.

//   Order Commitments: mutable NFT commitment to trade fungible token
  
//      byte16(LE)<quantity>   number of tokens remaining in order)
//      byte16(LE)<price>      price per token in sats
//      TODO: multiplier   pre-multiply the token price by some fixed constant (i.e. decimals)
//      ===
//      32 length

//   Transaction Building Modes:

//    Order Mode:
  
//      In "Order mode" outputs are submitted in pairs, with both the record for the order
//      and the cash value moving on the even "foot" and the tokens trading on the odd "foot".
    
//      orderAuth     input[even] -> output[even]  - An order NFT of category AuthCat (mutable)
//      assetVault    input[odd]  -> output[odd]   - An input or output of category AssetCat.

//    Withdraw Mode:
  
//      Transactions with a minting NFT may withdraw all outputs from the contract.
  
//      Auth             input[0] -> output[0]     - Authenticating NFT of category AuthCat (minting)
//                       input[i] -> output[*]     - Unrestricted spending

//   Note: 

//   The exchange owner(s) holds the minting NFT baton(s), which authorizes spending funds from the exchange.

//   
// CatDex - WIP 20250115
//
//   Parameters:
//
//     authCat - the token category authorizing trades or transfers (owner's NFT)
//     assetCat - the category of the fungible token being traded
//

<asset_category> <auth_category> 
// contract CatDex(bytes32 authCat, bytes32 assetCat){

//     function swap(){
    
        // Set the index of the order baton related to this trade
        OP_INPUTINDEX OP_INPUTINDEX OP_2 OP_MOD OP_SUB
        // int orderIndex = this.activeInputIndex - (this.activeInputIndex % 2);   

        // If the order input (even input) is a mutable auth Baton ... 
        OP_DUP OP_UTXOTOKENCATEGORY OP_2 OP_PICK OP_1 OP_CAT OP_EQUAL OP_IF        
        // if(tx.inputs[orderIndex].tokenCategory == authCat + 0x01){

            // Require the baton is passed back in an output of the same index with mutable capability
            OP_DUP OP_OUTPUTTOKENCATEGORY OP_2 OP_PICK OP_1 OP_CAT OP_EQUALVERIFY
            // require(tx.outputs[orderIndex].tokenCategory == authCat + 0x01);

            // Require the order baton be passed back to the contract
            OP_DUP OP_OUTPUTBYTECODE OP_OVER OP_UTXOBYTECODE OP_EQUALVERIFY
            // require(tx.outputs[orderIndex].lockingBytecode == 
            //          tx.inputs[orderIndex].lockingBytecode);

            // verify asset thread:
            // - output
            // - categoryId
            // - qty
            //

            // Get the next index of the asset thread
            OP_DUP OP_1ADD
            // int assetIndex = orderIndex + 1; 

            // Require the asset thread be sent at the current contract
            OP_DUP OP_OUTPUTBYTECODE OP_OVER OP_OUTPUTBYTECODE OP_EQUALVERIFY
            // require(tx.outputs[assetIndex].lockingBytecode == 
            //         tx.outputs[assetIndex].lockingBytecode);                 
                        
            // if the amount of tokens is greater than zero,
            OP_DUP OP_OUTPUTTOKENAMOUNT OP_0 OP_GREATERTHAN OP_IF
            // if(tx.outputs[assetIndex].tokenAmount > 0){
              // require the asset output contain token category specified by the order
              OP_DUP OP_OUTPUTTOKENCATEGORY OP_4 OP_PICK OP_EQUALVERIFY
            //   require(tx.outputs[assetIndex].tokenCategory == assetCat);
            // } 
            OP_ENDIF

            // Parse the order data from the NFT commitment
            OP_OVER OP_UTXOTOKENCOMMITMENT OP_16 OP_SPLIT
            // bytes quantityBin, bytes priceBin = 
            //               tx.inputs[orderIndex].nftCommitment.split(16);

            OP_OVER OP_BIN2NUM
            // int orderQuantity = int(quantityBin);  

            OP_OVER OP_BIN2NUM
            // int price = int(priceBin);

            // Get the amount of the token traded
            OP_4 OP_PICK OP_OUTPUTTOKENAMOUNT 
            OP_5 OP_PICK OP_UTXOTOKENAMOUNT OP_SUB
            // int tradeQuantity = tx.outputs[assetIndex].tokenAmount - 
            //                      tx.inputs[assetIndex].tokenAmount;

            // Verify new authCat order baton NFT commitment
            OP_2 OP_PICK OP_OVER OP_SUB OP_16 OP_NUM2BIN 
            OP_2 OP_PICK OP_16 OP_NUM2BIN OP_CAT
            // bytes32 nextCommitment = bytes16(orderQuantity+tradeQuantity) + bytes16(price);


            OP_7 OP_PICK OP_OUTPUTTOKENCOMMITMENT OP_OVER OP_EQUALVERIFY
            // require(tx.outputs[orderIndex].nftCommitment == nextCommitment);

            // require the sign of the quantity traded matches order  
            OP_OVER OP_0 OP_GREATERTHAN OP_4 OP_PICK OP_0 OP_LESSTHAN OP_BOOLAND OP_NOT OP_VERIFY
            // require(!(tradeQuantity > 0 && orderQuantity > 0)); 

            // require the amount traded be less than (or equal to) the quantity available
            OP_OVER OP_ABS OP_4 OP_PICK OP_ABS OP_LESSTHANOREQUAL OP_VERIFY
            // require(
            //     abs(tradeQuantity) <= abs(orderQuantity),
            //     "trade must be less than or equal to order quantity available"
            //     );


            // Verify the value returned with the order exceeds the quantity traded times the price.
            //
            // Examples:
            // 0 - 10,000 sats  ->  534 sats  
            //        |-> Buy -1000 @ 10 sat
            // 1 -      0 ft    -> 10,000 ft          534-10,000 >= -1000*10 OK
            //
            // 2 -  800 sats     -> 10,800 sats
            //       |-> Sell 1000 @ 10 sat/ft
            // 3 -  1,000 ft    -> 0 ft                   10,000 >= 1000*10 OK
            //
            OP_7 OP_PICK OP_OUTPUTVALUE OP_8 OP_PICK OP_UTXOVALUE OP_SUB 
            OP_2OVER OP_SWAP OP_MUL <100000000> OP_DIV OP_NEGATE OP_NUMEQUALVERIFY
            // require((tx.outputs[orderIndex].value - tx.inputs[orderIndex].value) >= -(tradeQuantity*price/100_000_000));
            //
      //   } 
        OP_2DROP OP_2DROP OP_2DROP OP_DROP
        //
        // otherwise, if the zeroth input contains the minting baton 
        OP_ELSE
      //   else{
            // Authentication failed, script fails.
            OP_0 OP_UTXOTOKENCATEGORY OP_2 OP_PICK OP_2 OP_CAT OP_EQUALVERIFY
            // require(tx.inputs[0].tokenCategory == authCat + 0x02);
      //   } 
        OP_ENDIF
//     }
    
// } 
OP_2DROP OP_DROP OP_1`}},F=["BCH_2024_05","BCH_2025_05"],q={$schema:A,description:C,name:U,entities:N,scenarios:D,scripts:R,supported:F},L="@unspent/catdex",K={name:L};class V{static USER_AGENT=K.name;static PROTOCOL_IDENTIFIER="U3X";static tokenAware=!0;static template=q;static compiler=x(this.template);static vm=E();static getLockingBytecode(e){typeof e=="string"&&(e=v(e));const t=this.compiler.generateBytecode({data:{bytecode:{auth_category:e}},scriptId:"catdex_blackboard"});if(!t.success)throw new Error("Failed to generate bytecode, script: , "+JSON.stringify(t,null,"  "));return t.bytecode}static getScriptHash(e,t=!0){return T(this.getLockingBytecode(e),t)}static getAddress(e,t="bitcoincash"){return B(this.getLockingBytecode(e),t,this.tokenAware)}}var M=c('<img alt="Disconnected"/>'),Q=c('<section><div class="status svelte-1jejjaq"><!> <!></div> <!></section>');function Z(a,e){y(e,!0);var t=Q(),n=d(t),i=d(n);O(i,{get template(){return V.template}});var b=l(i,2);{var f=o=>{var r=M();h(()=>k(r,"src",P)),s(o,r)};g(b,o=>{o(f,!1)})}u(n);var _=l(n,2);w(_),u(t),s(a,t),m()}export{Z as component,J as universal};
//# sourceMappingURL=6.Dd59fGir.js.map
