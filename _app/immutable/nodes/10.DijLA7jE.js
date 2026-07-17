import{f as k,a as b}from"../chunks/D5vjNr6G.js";import{aI as S,p as A,a as w,c as O,s as E,r as I,t as C}from"../chunks/ed2a0BbZ.js";import{i as D}from"../chunks/CzFjQkth.js";import{a as L}from"../chunks/DNVXvkt_.js";import"../chunks/mjdsc9Ix.js";import{B as N}from"../chunks/Bxjk7wdI.js";import{D as R}from"../chunks/DMvn4Q5j.js";import{i as U,h as a,G as H,t as q,H as F,b as V,k as $,l as x,d as M,x as Y,m as T,q as G,v as K}from"../chunks/D6NMCXg_.js";import{d as Q}from"../chunks/NPSzfOGJ.js";import{c as W}from"../chunks/BESLs7BN.js";const j=!0,ve=Object.freeze(Object.defineProperty({__proto__:null,prerender:j},Symbol.toStringTag,{value:"Module"}));var J=k('<h3>About Dutch Auctions</h3> <p>Straight dutch auctions begin with a high asking price that lowers until the first (winning) bid.</p> <p>On Bitcoin Cash (BCH), tokens can be auctioned by a simple contract using the age of the assets sent to the contract to determine the current asking price.</p> <p>More information about <a href="https://bitcoincashresearch.org/t/unspent-phi-v3-timelocking-token-aware-contracts/1501/3#dutch-token-auctions-1" rel="nofollow">the contract</a></p>',1);function X(s){var t=J();S(6),b(s,t)}const z="https://libauth.org/schemas/wallet-template-v0.schema.json",Z="Dutch: A descending ask token auction contract.",ee="Dutch",te={lock:{description:"Allow anyone to spend tokens held by the contract, provided the consignor is paid in the same transaction and a minimum ask descending price is met",name:"Dutch Auction Covenant",scripts:["unlock"],variables:{recipient:{description:"Locking bytecode for the proceeds from the auction sale.",name:"Recipient",type:"AddressData"},open:{description:"Integer setting the starting minimum bid value in satoshis.",name:"Open",type:"WalletData"}}},wallet:{description:"The entity buying tokens.",name:"Funding Entity",scripts:["wallet_lock","wallet_unlock"],variables:{key:{description:"The private key that controls this wallet.",name:"Key",type:"HdKey"}}}},ne={base:{data:{bytecode:{open:"100_000_000_000"}},description:"",name:"Unnamed Scenario"},buy:{data:{bytecode:{recipient:"0xa914e78564d75c446f8c00c757a2bd783d30c4f0819a87"},currentBlockHeight:100},description:"Anyone may buy any token output held by the auction contract by paying the consignor (receipt) the minimum required bid in the corresponding output.",extends:"base",name:"Buy token",transaction:{inputs:[{unlockingBytecode:["slot"],sequenceNumber:10},{unlockingBytecode:{script:"wallet_unlock"},outpointTransactionHash:"dead00000000000000000000000000000000000000000000000000000000beef",outpointIndex:1}],outputs:[{lockingBytecode:"a914e78564d75c446f8c00c757a2bd783d30c4f0819a87",valueSatoshis:1e10},{token:{amount:10,category:"0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef"},valueSatoshis:800}],version:2},sourceOutputs:[{lockingBytecode:["slot"],token:{amount:10,category:"0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef"},valueSatoshis:800},{lockingBytecode:{script:"wallet_lock"},valueSatoshis:1e10}]}},ie={unlock:{passes:["buy"],name:"Buy Lot",script:"// ",timeLockType:"height",unlocks:"lock"},wallet_unlock:{name:"Wallet Unlock",script:`<key.schnorr_signature.all_outputs>
<key.public_key>`,unlocks:"wallet_lock"},lock:{lockingType:"standard",name:"Dutch Auction Lock Script",script:`<"U3A"> <recipient> <open> 

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
//}

OP_NIP`},wallet_lock:{lockingType:"standard",name:"Wallet Lock",script:`OP_DUP
OP_HASH160 <$(<key.public_key> OP_HASH160
)> OP_EQUALVERIFY
OP_CHECKSIG`}},oe=["BCH_2026_05","BCH_SPEC"],ae={$schema:z,description:Z,name:ee,entities:te,scenarios:ne,scripts:ie,supported:oe},se="@unspent/dutch",ce={name:se};class re{static USER_AGENT=ce.name;static PROTOCOL_IDENTIFIER="U3A";static tokenAware=!0;static template=ae;static compiler=U(this.template);static vm=W();static dataToBytecode(t){return{open:H(t.open),recipient:a(t.recipient)}}static parseCommitment(t){typeof t=="string"&&(t=a(t));const e=Q(t);if(q(e[0])!==this.PROTOCOL_IDENTIFIER)throw Error(`"Non-${typeof this} record NFT passed as ${typeof this}"`);return{open:e[1],recipient:e[2]}}static encodeCommitment(t){let e=F(`<"${this.PROTOCOL_IDENTIFIER}"><${t.open}><0x${t.recipient}>
        `);if(typeof e=="string")throw e;return V(e)}static getLockingBytecode(t){const e=this.compiler.generateBytecode({data:{bytecode:t},scriptId:"lock"});if(!e.success)throw new Error("Failed to generate bytecode, script: , "+JSON.stringify(e,null,"  "));return e.bytecode}static getScriptHash(t,e=!0){let n=this.parseCommitment(t);return $(this.getLockingBytecode(n),e)}static getAddress(t,e="bitcoincash"){let n=this.dataToBytecode(t);return x(this.getLockingBytecode(n),e,this.tokenAware)}static getSourceOutput(t,e){return{lockingBytecode:this.getLockingBytecode(t),valueSatoshis:BigInt(e.value),token:e.token_data?{category:a(e.token_data.category),amount:BigInt(e.token_data.amount),nft:e.token_data.nft?{commitment:a(e.token_data.nft.commitment),capability:e.token_data.nft.capability}:void 0}:void 0}}static getInput(t,e,n){return{outpointIndex:e.tx_pos,outpointTransactionHash:a(e.tx_hash),sequenceNumber:n,unlockingBytecode:{data:{bytecode:t},compiler:this.compiler,script:"unlock",valueSatoshis:BigInt(e.value),token:e.token_data?{category:a(e.token_data.category),amount:BigInt(e.token_data.amount),nft:e.token_data.nft?{commitment:a(e.token_data.nft.commitment),capability:e.token_data.nft.capability}:void 0}:void 0}}}static getOutput(t,e){return{lockingBytecode:t.recipient,valueSatoshis:BigInt(e)}}static execute(t,e,n,c,d,l=0,h=1){let i={locktime:0,version:2,inputs:[],outputs:[]};const u=this.parseCommitment(t);let y=c-e.height,B=Math.round(M(u.open)/y)+1;const p=[this.getSourceOutput(u,e)];i.inputs.push(this.getInput(u,e,y)),i.outputs.push(this.getOutput(u,B)),i=Y(i,p,n,d,l);let o=T(i);if(!o.success)throw new Error("generate transaction failed!, errors: "+JSON.stringify(o.errors,null,"  "));const P=G(o.transaction,h),_=i.outputs.length-1;if(i.outputs[_].valueSatoshis=i.outputs[_].valueSatoshis-P,o=T(i),!o.success)throw new Error("generate transaction failed!, errors: "+JSON.stringify(o.errors,null,"  "));const g=o.transaction,v=K(g,p,{maximumTokenCommitmentLength:40});if(v!==!0)throw v;let f=this.vm.verify({sourceOutputs:p,transaction:g});if(typeof f=="string")throw f;return{sourceOutputs:p,transaction:g,verify:f}}}var ue=k('<img alt="Disconnected"/>'),pe=k('<section><div class="status svelte-1e0u92t"><!> <!></div> <!></section>');function Oe(s,t){A(t,!0);var e=pe(),n=O(e),c=O(n);N(c,{get template(){return re.template}});var d=E(c,2);{var l=r=>{var m=ue();C(()=>L(m,"src",R)),b(r,m)};D(d,r=>{r(l,-1)})}I(n);var h=E(n,2);X(h),I(e),b(s,e),w()}export{Oe as component,ve as universal};
//# sourceMappingURL=10.DijLA7jE.js.map
