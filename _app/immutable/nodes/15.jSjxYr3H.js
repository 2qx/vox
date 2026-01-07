import{f as r,a}from"../chunks/DYbKDSXk.js";import{au as g,p as O,a as P,c as p,s as l,r as d,t as E}from"../chunks/DlUVEpaU.js";import{i as I}from"../chunks/C6jlbT71.js";import{s as v}from"../chunks/vpaS6ag4.js";import"../chunks/vmZ8CxnS.js";import{B as T,D as y}from"../chunks/CReqLTTF.js";import{k as f,p as k,q as U,m as B,C as b,b as x,K as N}from"../chunks/0o8OGYDl.js";import{s as h}from"../chunks/c_jpW-Jm.js";const R=!0,ot=Object.freeze(Object.defineProperty({__proto__:null,prerender:R},Symbol.toStringTag,{value:"Module"}));var A=r("<h3>About Irrevocable Trusts</h3> <p>An unspent trust is a simple monthly annuity.</p>",1);function C(o){var t=A();g(2),a(o,t)}const D="https://libauth.org/schemas/wallet-template-v0.schema.json",L="Pay one percent of a fund monthly in perpetuity",S="Perpetuity",V={trust:{description:"Contract creation and function trust",name:"Trust configuration",scripts:["lock","unlock"],variables:{recipient:{description:"Locking bytecode receiving payments",name:"recipientLockingBytecode",type:"WalletData"}}}},H={installment:{data:{bytecode:{recipient:"0xa914e78564d75c446f8c00c757a2bd783d30c4f0819a87"}},description:"Pay a monthly installment.",name:"Installment",transaction:{inputs:[{outpointTransactionHash:"dead00000000000000000000000000000000000000000000000000000000beef",outpointIndex:0,unlockingBytecode:["slot"],sequenceNumber:4383}],outputs:[{lockingBytecode:"a914e78564d75c446f8c00c757a2bd783d30c4f0819a87",valueSatoshis:1e5},{lockingBytecode:{},valueSatoshis:9899950}],version:2},sourceOutputs:[{lockingBytecode:["slot"],valueSatoshis:1e7}]}},q={unlock:{passes:["installment"],name:"unlock",script:`// 
// none
`,unlocks:"lock"},lock:{lockingType:"p2sh32",name:"lock",script:`// "Perpetuity" contract constructor parameters
<recipient> 

// contract Perpetuity(

 // lockingBytecode of the beneficiary, 
 // the address receiving payments
// bytes recipientLockingBytecode,

// ) {
  // function execute() {

  // Force tx version equal to 2 to force BIP68 support
  OP_TXVERSION OP_2 OP_NUMEQUALVERIFY 
  // require(tx.version == 2);
  
  // Check that time has passed and that time locks are enabled
  <4383> OP_CHECKSEQUENCEVERIFY OP_DROP 
  // require(this.age >= 4383);

  // Check that the first output sends to the recipient
  OP_0 OP_OUTPUTBYTECODE OP_EQUALVERIFY 
  // require(tx.outputs[this.activeInputIndex].lockingBytecode == recipientLockingBytecode);

  // Check that the output sends a normal installment
  OP_0 OP_OUTPUTVALUE OP_INPUTINDEX OP_UTXOVALUE <100> OP_DIV OP_GREATERTHANOREQUAL OP_VERIFY 
  // require(tx.outputs[this.activeInputIndex].value >= tx.inputs[this.activeInputIndex].value/100);
  
  // push the output index
  // which is the current input times two
  OP_INPUTINDEX OP_TXINPUTCOUNT OP_ADD OP_DUP
  // int outIndex = this.activeInputIndex + tx.inputs.length;
  
  // require the second output match the active bytecode
  OP_OUTPUTBYTECODE OP_INPUTINDEX OP_UTXOBYTECODE OP_EQUALVERIFY
  // require(tx.outputs[outIndex].lockingBytecode == tx.inputs[this.activeInputIndex].lockingBytecode);

  // balance was returned to the contract, minus 5/1,000,000 for executor fee
  OP_OUTPUTVALUE OP_INPUTINDEX OP_UTXOVALUE <989995> OP_MUL <1000000> OP_DIV OP_GREATERTHANOREQUAL
  // require(tx.outputs[outIndex].value >= tx.inputs[this.activeInputIndex].value*989995/1000000);
  
// }
//}`}},X=["BCH_2022_05","BCH_2023_05","BCH_2024_05","BCH_2025_05","BCH_SPEC"],w={$schema:D,description:L,name:S,entities:V,scenarios:H,scripts:q,supported:X},Y="@unspent/trust",F={name:Y},M=4383,j=989995,Q=1e6;class ${static USER_AGENT=F.name;static template=w;static compiler=f(this.template);static getLockingBytecode(t={}){const e=this.compiler.generateBytecode({data:t,scriptId:"lock"});if(!e.success)throw new Error("Failed to generate bytecode, script: , "+h(e));return e.bytecode}static getScriptHash(t=!0){return k(this.getLockingBytecode(),t)}static getAddress(t="bitcoincash"){return U(this.getLockingBytecode(),t)}static getOutput(t){let e=Math.round(t.value*j/Q)-1;return{lockingBytecode:{compiler:this.compiler,script:"lock"},valueSatoshis:BigInt(e)}}static getInput(t){return{outpointIndex:t.tx_pos,outpointTransactionHash:B(t.tx_hash),sequenceNumber:M,unlockingBytecode:{compiler:this.compiler,script:"unlock",valueSatoshis:BigInt(t.value)}}}static processOutpoint(t){const e=[],n=[];n.push(this.getOutput(t)),e.push(this.getInput(t));const s=b({locktime:0,version:2,inputs:e,outputs:n});if(!s.success)throw new Error("generate transaction failed!, errors: "+h(s.errors));return x(N(s.transaction))}}var G=r('<img alt="Disconnected"/>'),K=r('<section><div class="status svelte-1jejjaq"><!> <!></div> <!></section>');function it(o,t){O(t,!0);var e=K(),n=p(e),i=p(n);T(i,{get template(){return $.template}});var s=l(i,2);{var m=c=>{var u=G();E(()=>v(u,"src",y)),a(c,u)};I(s,c=>{c(m,!1)})}d(n);var _=l(n,2);C(_),d(e),a(o,e),P()}export{it as component,ot as universal};
//# sourceMappingURL=15.jSjxYr3H.js.map
