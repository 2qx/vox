import{f as l,a as p}from"../chunks/DYbKDSXk.js";import{au as g,p as T,a as I,c as h,s as d,r as k,t as E}from"../chunks/DlUVEpaU.js";import{i as _}from"../chunks/C6jlbT71.js";import{s as v}from"../chunks/vpaS6ag4.js";import"../chunks/vmZ8CxnS.js";import{B as f,D as y}from"../chunks/CReqLTTF.js";import{k as P,m as O,G as b,p as N,q as U,C as L,E as B,b as A,F as x}from"../chunks/0o8OGYDl.js";import{c as C}from"../chunks/B6Foiicm.js";const R=!0,it=Object.freeze(Object.defineProperty({__proto__:null,prerender:R},Symbol.toStringTag,{value:"Module"}));var S=l('<h3>About Locktime</h3> <p>Locktime allows locking coins (or CashTokens) until some future date.</p> <p><strong>⚠️ NOTE: All assets remain LOCKED until the specified time, with no early withdraws possible.</strong></p> <p>More about the <a href="https://bitcoincashresearch.org/t/unspent-phi-v3-timelocking-token-aware-contracts/1501#absolute-timelock-bip65-hodl-style-vault-with-cashtoken-support-1" rel="nofollow">contract here</a></p> <h3>See Also:</h3> <p>The <a href="https://github.com/mainnet-pat/hodl_ec_plugin" rel="nofollow">HODL Electron Cash plugin</a> by mainnet-pat (pat#111222)</p>',1);function D(r){var e=S();g(10),p(r,e)}const w="https://libauth.org/schemas/wallet-template-v0.schema.json",M="Locktime: A hodl-style locking contract",X="Locktime",q={covenant:{description:"Lock coins (or tokens) until some later time. Assets may be automatically released from the vault if the parameters or the contract are published.",name:"Locktime Vault",scripts:["lock","unlock"],variables:{locktime:{description:"The absolute block time to lock assets until. May be a block in the past.",name:"Locktime",type:"WalletData"},recipient:{description:"Locking bytecode assets can be sent to when the locktime is reached.",name:"Recipient",type:"AddressData"}}}},V={base:{data:{bytecode:{}},description:"",name:"Base Scenario"},release:{data:{bytecode:{locktime:"10",recipient:"0xa914e78564d75c446f8c00c757a2bd783d30c4f0819a87"}},description:"",extends:"base",name:"Release Assets",transaction:{inputs:[{unlockingBytecode:["slot"],sequenceNumber:10}],outputs:[{lockingBytecode:"a914e78564d75c446f8c00c757a2bd783d30c4f0819a87",valueSatoshis:800}],locktime:11,version:2},sourceOutputs:[{lockingBytecode:["slot"],valueSatoshis:800}]}},F={unlock:{passes:["release"],name:"Unlock",script:" // ",unlocks:"lock"},lock:{lockingType:"p2sh32",name:"Locktime Covenant",script:`//
// A contract to hodl until a pre-defined block
// 
// contract Locktime(
<recipient> <locktime> 
//   // length of time to lock contract, blocks
//   int locktime,

//   // LockingBytecode of the beneficiary, the address receiving payments
//   bytes recipientLockingBytecode

// ) {
//   function execute() {

// Require version 2 for BIP68 support
OP_TXVERSION OP_2 OP_NUMEQUALVERIFY
//require(tx.version == 2);

// Check that time has passed and that time locks are enabled
OP_CHECKLOCKTIMEVERIFY OP_DROP
// require(tx.time >= locktime);

// Check that each output sends to the recipient
OP_INPUTINDEX OP_OUTPUTBYTECODE OP_EQUALVERIFY
// require(tx.outputs[this.activeInputIndex].lockingBytecode == 
//         recipientLockingBytecode);

// Check that each output sends the balance minus an executor allowance
OP_INPUTINDEX OP_OUTPUTVALUE 
OP_INPUTINDEX OP_UTXOVALUE <2500> OP_SUB OP_GREATERTHANOREQUAL OP_VERIFY
// require(tx.outputs[this.activeInputIndex].value >= 
//         tx.inputs[this.activeInputIndex].value - 2500);

// Require tokens go forward
OP_INPUTINDEX OP_OUTPUTTOKENAMOUNT 
OP_INPUTINDEX OP_UTXOTOKENAMOUNT OP_NUMEQUALVERIFY 
// require(tx.outputs[this.activeInputIndex].tokenAmount == 
//         tx.inputs[this.activeInputIndex].tokenAmount);

// Must pass the same token
OP_INPUTINDEX OP_OUTPUTTOKENCATEGORY 
OP_INPUTINDEX OP_UTXOTOKENCATEGORY OP_EQUALVERIFY 
// require(tx.outputs[this.activeInputIndex].tokenCategory == 
//         tx.inputs[this.activeInputIndex].tokenCategory);

// Must pass along NFT commitments, if present.
OP_INPUTINDEX OP_OUTPUTTOKENCOMMITMENT 
OP_INPUTINDEX OP_UTXOTOKENCOMMITMENT OP_EQUAL
// require(tx.outputs[this.activeInputIndex].nftCommitment == 
//         tx.inputs[this.activeInputIndex].nftCommitment);

// }
//}`}},H=["BCH_2023_05","BCH_SPEC"],K=0,Y={$schema:w,description:M,name:X,entities:q,scenarios:V,scripts:F,supported:H,version:K},j="@unspent/locktime",Q={name:j};class G{static USER_AGENT=Q.name;static PROTOCOL_IDENTIFIER="U3L";static tokenAware=!0;static template=Y;static compiler=P(this.template);static vm=C();static dataToBytecode(e){return{locktime:b(e.locktime),recipient:O(e.recipient)}}static getLockingBytecode(e){const t=this.compiler.generateBytecode({data:{bytecode:this.dataToBytecode(e)},scriptId:"lock"});if(!t.success)throw new Error("Failed to generate bytecode, script: , "+JSON.stringify(t,null,"  "));return t.bytecode}static getScriptHash(e,t=!0){return N(this.getLockingBytecode(e),t)}static getAddress(e,t="bitcoincash"){return U(this.getLockingBytecode(e),t,this.tokenAware)}static getSourceOutput(e,t){return{lockingBytecode:this.getLockingBytecode(e),valueSatoshis:BigInt(t.value)}}static getInput(e,t){return{outpointIndex:t.tx_pos,outpointTransactionHash:O(t.tx_hash),sequenceNumber:t.value,unlockingBytecode:{data:{bytecode:this.dataToBytecode(e)},compiler:this.compiler,script:"unlock",valueSatoshis:BigInt(t.value)}}}static getOutput(){return{lockingBytecode:{data:{},compiler:this.compiler,script:"op_return"},valueSatoshis:BigInt(0)}}static getSourceOutputs(e,t){const n=[];return n.push(...t.map(s=>this.getSourceOutput(e,s))),n}static unlock(e,t){let i={locktime:0,version:2,inputs:[],outputs:[]};i.inputs.push(this.getInput(e,t)),i.outputs.push(this.getOutput());let a=L(i);if(!a.success)throw new Error("generate transaction failed!, errors: "+JSON.stringify(a.errors,null,"  "));const u=[this.getSourceOutput(e,t)],o=a.transaction,c=B(o,u,{maximumTokenCommitmentLength:40});if(c!==!0)throw c;let m=this.vm.verify({sourceOutputs:u,transaction:o});if(typeof m=="string")throw m;return A(x(o))}}var $=l('<img alt="Disconnected"/>'),J=l('<section><div class="status svelte-1jejjaq"><!> <!></div> <!></section>');function at(r,e){T(e,!0);var t=J(),n=h(t),s=h(n);f(s,{get template(){return G.template}});var i=d(s,2);{var a=o=>{var c=$();E(()=>v(c,"src",y)),p(o,c)};_(i,o=>{o(a,!1)})}k(n);var u=d(n,2);D(u),k(t),p(r,t),I()}export{at as component,it as universal};
//# sourceMappingURL=11.Duc5mMni.js.map
