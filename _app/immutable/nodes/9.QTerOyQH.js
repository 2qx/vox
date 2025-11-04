import{f as d,a as l}from"../chunks/DYbKDSXk.js";import{au as y,p as _,a as v,c as m,s as b,r as f,t as O}from"../chunks/DlUVEpaU.js";import{i as B}from"../chunks/C6jlbT71.js";import{s as E}from"../chunks/vpaS6ag4.js";import"../chunks/vmZ8CxnS.js";import{B as T,D as I}from"../chunks/DpKBRRcz.js";import{k as P,l as p,q as S,r as k,m as A,o as w,v as D,b as C,p as L}from"../chunks/DLngWCRZ.js";import{a as H}from"../chunks/BP7KE8cK.js";import{g as R}from"../chunks/4WAd-rdk.js";const N=!0,re=Object.freeze(Object.defineProperty({__proto__:null,prerender:N},Symbol.toStringTag,{value:"Module"}));var U=d('<h3>About Dutch Auctions</h3> <p>Straight dutch auctions begin with a high asking price that lowers until the first (winning) bid.</p> <p>On Bitcoin Cash (BCH), tokens can be auctioned by a simple contract using the age of the assets sent to the contract to determine the current asking price.</p> <p>More information about <a href="https://bitcoincashresearch.org/t/unspent-phi-v3-timelocking-token-aware-contracts/1501/3#dutch-token-auctions-1" rel="nofollow">the contract</a></p>',1);function x(a){var n=U();y(6),l(a,n)}const q="https://libauth.org/schemas/wallet-template-v0.schema.json",V="Dutch: A descending ask token auction contract.",F="Dutch",j={lock:{description:"Allow anyone to spend tokens held by the contract, provided the consignor is paid in the same transaction and a minimum ask descending price is met",name:"Dutch Auction Covenant",scripts:["unlock"],variables:{recipient:{description:"Locking bytecode for the proceeds from the auction sale.",name:"Recipient",type:"AddressData"},open:{description:"Integer setting the starting minimum bid value in satoshis.",name:"Open",type:"WalletData"}}},bidder:{description:"The entity buying tokens.",name:"Funding Entity",scripts:["wallet_lock","wallet_unlock"],variables:{key:{description:"The private key that controls this wallet.",name:"Key",type:"HdKey"}}}},M={base:{data:{bytecode:{open:"100_000_000_000"}},description:"",name:"Unnamed Scenario"},buy:{data:{bytecode:{recipient:"0xa914e78564d75c446f8c00c757a2bd783d30c4f0819a87"},currentBlockHeight:100},description:"Anyone may buy any token output held by the auction contract by paying the consignor (receipt) the minimum required bid in the corresponding output.",extends:"base",name:"Buy token",transaction:{inputs:[{unlockingBytecode:["slot"],sequenceNumber:10},{unlockingBytecode:{script:"wallet_unlock"},outpointTransactionHash:"dead00000000000000000000000000000000000000000000000000000000beef",outpointIndex:1}],outputs:[{lockingBytecode:"a914e78564d75c446f8c00c757a2bd783d30c4f0819a87",valueSatoshis:1e10},{token:{amount:10,category:"0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef"},valueSatoshis:800}],version:2},sourceOutputs:[{lockingBytecode:["slot"],token:{amount:10,category:"0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef"},valueSatoshis:800},{lockingBytecode:{script:"wallet_lock"},valueSatoshis:1e10}]}},Y={unlock:{passes:["buy"],name:"Buy Lot",script:"// ",timeLockType:"height",unlocks:"lock"},lock:{lockingType:"p2sh32",name:"Dutch Auction Lock Script",script:`<recipient> <open> 

// contract DutchAuction(

//   // Opening bid 
//   int open,

//   // LockingBytecode of the consigner, the address receiving proceeds
//   bytes recipientLockingBytecode

// ) {

// Require version 2 for BIP68 support
OP_TXVERSION OP_2 OP_NUMEQUALVERIFY 
// require(tx.version == 2);

// The asking price is the opening bid divided by the utxo age in blocks.
OP_INPUTINDEX OP_OUTPUTVALUE OP_DIV 
// int requiredAge = open/tx.outputs[this.activeInputIndex].value;

// Require the active input nSequence number is provided in blocks.
<65535> OP_OVER OP_GREATERTHAN OP_VERIFY 
// require(65535 > requiredAge);

// Enforce the minium ask given the age of the input. 
  OP_CHECKSEQUENCEVERIFY OP_DROP 
// require(tx.age >= requiredAge);

// Check that each output sends to the consignor
OP_INPUTINDEX OP_OUTPUTBYTECODE OP_EQUAL
// require(tx.outputs[this.activeInputIndex].lockingBytecode == 
//       recipientLockingBytecode,);

//  }
//}`},wallet_unlock:{name:"Wallet Unlock",script:`<key.schnorr_signature.all_outputs>
<key.public_key>`,unlocks:"wallet_lock"},wallet_lock:{lockingType:"standard",name:"Wallet Lock",script:`OP_DUP
OP_HASH160 <$(<key.public_key> OP_HASH160
)> OP_EQUALVERIFY
OP_CHECKSIG`}},$=["BCH_2023_05","BCH_2024_05","BCH_2025_05","BCH_SPEC"],K=0,Q={$schema:q,description:V,name:F,entities:j,scenarios:M,scripts:Y,supported:$,version:K},G="@unspent/dutch",W={name:G};class X{static USER_AGENT=W.name;static PROTOCOL_IDENTIFIER="U3A";static tokenAware=!0;static template=Q;static compiler=P(this.template);static vm=H();static dataToBytecode(n){return{open:S(n.locktime),recipient:p(n.recipient)}}static getLockingBytecode(n,e){typeof e=="string"&&(e=p(e));const t=this.compiler.generateBytecode({data:{bytecode:{open:k(BigInt(n)),recipient:e}},scriptId:"lock"});if(!t.success)throw new Error("Failed to generate bytecode, script: , "+JSON.stringify(t,null,"  "));return t.bytecode}static getScriptHash(n,e,t=!0){return A(this.getLockingBytecode(n,e),t)}static getAddress(n,e,t="bitcoincash"){return w(this.getLockingBytecode(n,e),t,this.tokenAware)}static getSourceOutput(n,e,t){return{lockingBytecode:this.getLockingBytecode(n,e),valueSatoshis:BigInt(t.value)}}static getInput(n,e,t){return typeof e=="string"&&(e=p(e)),{outpointIndex:t.tx_pos,outpointTransactionHash:p(t.tx_hash),sequenceNumber:t.value,unlockingBytecode:{data:{bytecode:{open:k(BigInt(n)),recipient:e}},compiler:this.compiler,script:"unlock",valueSatoshis:BigInt(t.value)}}}static getSourceOutputs(n,e,t){const o=[];return o.push(...t.map(r=>this.getSourceOutput(n,e,r))),o}static bid(n,e,t){let u={locktime:0,version:2,inputs:[],outputs:[]};u.inputs.push(this.getInput(n,e,t));let c=R(u);if(!c.success)throw new Error("generate transaction failed!, errors: "+JSON.stringify(c.errors,null,"  "));const i=[this.getSourceOutput(n,e,t)],s=c.transaction,h=D(s,i,{maximumTokenCommitmentLength:40});if(h!==!0)throw h;let g=this.vm.verify({sourceOutputs:i,transaction:s});if(typeof g=="string")throw g;return C(L(s))}}var J=d('<img alt="Disconnected"/>'),z=d('<section><div class="status svelte-1jejjaq"><!> <!></div> <!></section>');function ue(a,n){_(n,!0);var e=z(),t=m(e),o=m(t);T(o,{get template(){return X.template}});var r=b(o,2);{var u=i=>{var s=J();O(()=>E(s,"src",I)),l(i,s)};B(r,i=>{i(u,!1)})}f(t);var c=b(t,2);x(c),f(e),l(a,e),v()}export{ue as component,re as universal};
//# sourceMappingURL=9.QTerOyQH.js.map
