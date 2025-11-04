import{f as d,a as p}from"../chunks/DYbKDSXk.js";import{au as f,p as k,a as v,c as h,s as g,r as y,t as b}from"../chunks/DlUVEpaU.js";import{i as O}from"../chunks/C6jlbT71.js";import{s as _}from"../chunks/vpaS6ag4.js";import"../chunks/vmZ8CxnS.js";import{B as T,D as x}from"../chunks/DpKBRRcz.js";import{k as E,l,m as I,o as S,v as P,b as B,p as R}from"../chunks/DLngWCRZ.js";import{a as U}from"../chunks/BP7KE8cK.js";import{g as N}from"../chunks/4WAd-rdk.js";const A=!0,se=Object.freeze(Object.defineProperty({__proto__:null,prerender:A},Symbol.toStringTag,{value:"Module"}));var w=d('<h3>About SmallIndex</h3> <p>Small Index is a key-value database protocol for storage small entries (40-bytes or less) at a rate of 1 satoshi per block for up to a year.</p> <p>More information about <a href="https://bitcoincashresearch.org/t/a-small-key-value-index-contract/1471" rel="nofollow">the contract</a></p>',1);function C(r){var t=w();f(4),p(r,t)}const L="https://libauth.org/schemas/wallet-template-v0.schema.json",D="Small Index: A distributed key-value database system.",q="SmallIndex",H={small_index_covenant:{description:`Store data records in NFT commitments. 

Each "key" corresponds to a different contract address, where the token balance stores the values for that key. Each record exists in the data commitment of a non-fungible token of any category (currently 40 bytes in length). Each record pays a flat storage fee of one satoshi per block. Expired records can be burned by anyone to benefit the party mining the next block.

 The Small Index covenant defines a storage mechanism, but the schema for data within the records is left to application designers. Since anyone may write to any record, applications must verify all claims, or use an authorization scheme to validate data.`,name:"Small Index Covenant",scripts:["unlock"],variables:{key:{description:"Bytes representing the key of the index. Each new key results in a new covenant address. ",name:"Key",type:"WalletData"}}}},V={drop:{data:{bytecode:{key:""}},description:"Drop a expired record value from the dataset. This spending pathway 'burns' token data as an return operation (OP_RETURN) output, and releases the satoshi value to be claimed by the party mining the next block.",name:"Record drop",transaction:{locktime:0,inputs:[{outpointTransactionHash:"0e09765ada34fa0bd94ef9df8497173e8aefc560f3eb7c9e0e88b345c4cccb36",outpointIndex:0,unlockingBytecode:["slot"],sequenceNumber:500}],outputs:[{lockingBytecode:{script:"op_return"}}],version:2},sourceOutputs:[{lockingBytecode:["slot"],valueSatoshis:500,token:{nft:{commitment:"0x6a<TST><'Hello World'>"}}}]}},F={unlock:{passes:["drop"],name:"Drop Record",script:`// Dropping a record is authorized 
// using only introspection from properties of 
// the expired record unspent output.`,timeLockType:"height",unlocks:"lock"},op_return:{lockingType:"standard",name:"Return Operation",script:"OP_RETURN"},lock:{lockingType:"p2sh32",name:"Small Index Locking Script",script:`// pragma cashscript 0.10.0;

// Small Index 
// 
// A subscription based key-value index 
//

// Including the key here creates a different covenant for each key-value
<key> OP_DROP
// contract SmallIndex(bytes key) {
    
    // Secure outputs with data in token commitments for a given key.
    // 
    // All entries pay a fixed storage fee of 1 satoshi per block. 
    //
    // If an entry has expired, miners may drop it.
    //
    // Miners can drop many expired entires at once.
    //

// function drop() {

// Require each input age be higher than the utxo value
    OP_INPUTINDEX OP_UTXOVALUE OP_CHECKSEQUENCEVERIFY OP_DROP
// require(tx.age >= tx.inputs[this.activeInputIndex].value);

// See TokenBurner - Dagur Valberg Johannsson
//
// Require a single output
   OP_TXOUTPUTCOUNT OP_1 OP_NUMEQUALVERIFY 
// require(tx.outputs.length == 1);

// Without BCH
   OP_0 OP_OUTPUTVALUE OP_0 OP_NUMEQUALVERIFY
// require(tx.outputs[0].value == 0);

// Without tokens
   OP_0 OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUALVERIFY
// require(tx.outputs[0].tokenCategory == 0x);

// As an empty OP_RETURN
   OP_0 OP_OUTPUTBYTECODE <0x6a> OP_EQUAL
// require(tx.outputs[0].lockingBytecode == 0x6a);

//    }
// }`}},M=["BCH_2023_05","BCH_SPEC"],j=0,Y={$schema:L,description:D,name:q,entities:H,scenarios:V,scripts:F,supported:M,version:j},Q="@unspent/small",W={name:Q};class ${static USER_AGENT=W.name;static PROTOCOL_IDENTIFIER="U3R";static VERSION="1.0.0";static tokenAware=!0;static template=Y;static compiler=E(this.template);static vm=U();static getLockingBytecode(t){const e=this.compiler.generateBytecode({data:{bytecode:{key:l(t)}},scriptId:"lock"});if(!e.success)throw new Error("Failed to generate bytecode, script: , "+JSON.stringify(e,null,"  "));return e.bytecode}static getScriptHash(t,e=!0){return I(this.getLockingBytecode(t),e)}static getAddress(t,e="bitcoincash"){return S(this.getLockingBytecode(t),e,this.tokenAware)}static getSourceOutput(t,e){return{lockingBytecode:this.getLockingBytecode(t),valueSatoshis:BigInt(e.value)}}static getInput(t,e){return{outpointIndex:e.tx_pos,outpointTransactionHash:l(e.tx_hash),sequenceNumber:e.value,unlockingBytecode:{data:{bytecode:{key:l(t)}},compiler:this.compiler,script:"unlock",valueSatoshis:BigInt(e.value)}}}static getOutput(){return{lockingBytecode:{data:{},compiler:this.compiler,script:"op_return"},valueSatoshis:BigInt(0)}}static drop(t,e){let a={locktime:0,version:2,inputs:[],outputs:[]};a.inputs.push(this.getInput(t,e)),a.outputs.push(this.getOutput());let o=N(a);if(!o.success)throw new Error("generate transaction failed!, errors: "+JSON.stringify(o.errors,null,"  "));const c=[this.getSourceOutput(t,e)],n=o.transaction,s=P(n,c,{maximumTokenCommitmentLength:40});if(s!==!0)throw s;let m=this.vm.verify({sourceOutputs:c,transaction:n});if(typeof m=="string")throw m;return B(R(n))}}var z=d('<img alt="Disconnected"/>'),J=d('<section><div class="status svelte-1jejjaq"><!> <!></div> <!></section>');function re(r,t){k(t,!0);var e=J(),i=h(e),u=h(i);T(u,{get template(){return $.template}});var a=g(u,2);{var o=n=>{var s=z();b(()=>_(s,"src",x)),p(n,s)};O(a,n=>{n(o,!1)})}y(i);var c=g(i,2);C(c),y(e),p(r,e),v()}export{re as component,se as universal};
//# sourceMappingURL=7.CPqOf2cd.js.map
