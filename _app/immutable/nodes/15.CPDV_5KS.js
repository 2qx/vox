import{f as r,a as c}from"../chunks/DYbKDSXk.js";import{au as g,p as O,a as E,c as p,s as l,r as d,t as P}from"../chunks/DlUVEpaU.js";import{i as f}from"../chunks/C6jlbT71.js";import{s as v}from"../chunks/vpaS6ag4.js";import"../chunks/vmZ8CxnS.js";import{B as y,D as T}from"../chunks/DpKBRRcz.js";import{k,m as I,o as U,l as B,b,x as R}from"../chunks/DLngWCRZ.js";import{s as m}from"../chunks/yjHrmcRe.js";import{g as x}from"../chunks/4WAd-rdk.js";const N=!0,at=Object.freeze(Object.defineProperty({__proto__:null,prerender:N},Symbol.toStringTag,{value:"Module"}));var A=r("<h3>About Irrevocable Trusts</h3> <p>An unspent trust is a simple monthly annuity.</p>",1);function L(s){var t=A();g(2),c(s,t)}const C="https://libauth.org/schemas/wallet-template-v0.schema.json",D="Pay one percent of a fund monthly in perpetuity",V="Perpetuity",S={trust:{description:"Contract creation and function trust",name:"Trust configuration",scripts:["lock","unlock"],variables:{recipient:{description:"Locking bytecode receiving payments",name:"recipientLockingBytecode",type:"WalletData"}}}},H={installment:{data:{bytecode:{recipient:"0xa914e78564d75c446f8c00c757a2bd783d30c4f0819a87"}},description:"Pay a monthly installment.",name:"Installment",transaction:{inputs:[{outpointTransactionHash:"dead00000000000000000000000000000000000000000000000000000000beef",outpointIndex:0,unlockingBytecode:["slot"],sequenceNumber:4383}],outputs:[{lockingBytecode:"a914e78564d75c446f8c00c757a2bd783d30c4f0819a87",valueSatoshis:1e5},{lockingBytecode:{},valueSatoshis:9899950}],version:2},sourceOutputs:[{lockingBytecode:["slot"],valueSatoshis:1e7}]}},q={unlock:{passes:["installment"],name:"unlock",script:`// 
// none
`,unlocks:"lock"},lock:{lockingType:"p2sh32",name:"lock",script:`// "Perpetuity" contract constructor parameters
<recipient> 

// contract Perpetuity(

 // lockingBytecode of the beneficiary, 
 // the address receiving payments
//  bytes recipientLockingBytecode,

// ) {
//  function execute() {

  // Force tx version equal to 2 to force BIP68 support
  OP_TXVERSION OP_2 OP_NUMEQUALVERIFY 
//   require(tx.version == 2);
  
  // Check that time has passed and that time locks are enabled
  <4383> OP_CHECKSEQUENCEVERIFY OP_DROP 
//   require(tx.age >= 4383);

  // Limit to a single utxo input
  OP_TXINPUTCOUNT OP_1 OP_NUMEQUALVERIFY 
//   require(tx.inputs.length == 1);

  // Check that the first output sends to the recipient
  OP_0 OP_OUTPUTBYTECODE OP_EQUALVERIFY 
//   require(tx.outputs[0].lockingBytecode == recipientLockingBytecode);

  // Check that the output sends a normal installment
  OP_0 OP_OUTPUTVALUE OP_INPUTINDEX OP_UTXOVALUE <100> OP_DIV OP_GREATERTHANOREQUAL OP_VERIFY 
//   require(tx.outputs[0].value >= tx.inputs[this.activeInputIndex].value/100);

  // require the second output match the active bytecode
  OP_1 OP_OUTPUTBYTECODE OP_INPUTINDEX OP_UTXOBYTECODE OP_EQUALVERIFY 
//   require(tx.outputs[1].lockingBytecode == tx.inputs[this.activeInputIndex].lockingBytecode);

  // balance was returned to the contract, minus 5/1,000,000 for executor fee
  OP_1 OP_OUTPUTVALUE OP_INPUTINDEX OP_UTXOVALUE <989995> OP_MUL <1000000> OP_DIV OP_GREATERTHANOREQUAL
//   require(tx.outputs[1].value >= tx.inputs[this.activeInputIndex].value*989995/1000000);
  
//  }
// }`}},Y=["BCH_2022_05","BCH_2023_05","BCH_2024_05","BCH_2025_05","BCH_SPEC"],F=0,M={$schema:C,description:D,name:V,entities:S,scenarios:H,scripts:q,supported:Y,version:F},X="@unspent/trust",Q={name:X},j=4383,w=989995,$=1e6;class G{static USER_AGENT=Q.name;static template=M;static compiler=k(this.template);static getLockingBytecode(t={}){const e=this.compiler.generateBytecode({data:t,scriptId:"lock"});if(!e.success)throw new Error("Failed to generate bytecode, script: , "+m(e));return e.bytecode}static getScriptHash(t=!0){return I(this.getLockingBytecode(),t)}static getAddress(t="bitcoincash"){return U(this.getLockingBytecode(),t)}static getOutput(t){let e=Math.round(t.value*w/$)-1;return{lockingBytecode:{compiler:this.compiler,script:"lock"},valueSatoshis:BigInt(e)}}static getInput(t){return{outpointIndex:t.tx_pos,outpointTransactionHash:B(t.tx_hash),sequenceNumber:j,unlockingBytecode:{compiler:this.compiler,script:"unlock",valueSatoshis:BigInt(t.value)}}}static processOutpoint(t){const e=[],n=[];n.push(this.getOutput(t)),e.push(this.getInput(t));const o=x({locktime:0,version:2,inputs:e,outputs:n});if(!o.success)throw new Error("generate transaction failed!, errors: "+m(o.errors));return b(R(o.transaction))}}var z=r('<img alt="Disconnected"/>'),K=r('<section><div class="status svelte-1jejjaq"><!> <!></div> <!></section>');function ct(s,t){O(t,!0);var e=K(),n=p(e),i=p(n);y(i,{get template(){return G.template}});var o=l(i,2);{var h=a=>{var u=z();P(()=>v(u,"src",T)),c(a,u)};f(o,a=>{a(h,!1)})}d(n);var _=l(n,2);L(_),d(e),c(s,e),E()}export{ct as component,at as universal};
//# sourceMappingURL=15.CPDV_5KS.js.map
