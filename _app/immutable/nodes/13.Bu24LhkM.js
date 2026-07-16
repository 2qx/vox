import{f as y,a as O}from"../chunks/BQ8W2y5r.js";import{aI as B,p as L,a as C,c as T,s as I,r as v,t as w}from"../chunks/5yJvB4cG.js";import{i as A}from"../chunks/C92i--r8.js";import{s as R}from"../chunks/BGVSAru1.js";import"../chunks/Bx2aHIrS.js";import{B as S}from"../chunks/Cnk_cigO.js";import{D}from"../chunks/DMvn4Q5j.js";import{i as x,h as u,G as F,t as M,b,k as X,l as V,w as q,x as H,m as f,q as P,v as N,d as K}from"../chunks/D6NMCXg_.js";import{d as Y}from"../chunks/NPSzfOGJ.js";import{c as Q}from"../chunks/BESLs7BN.js";import{s as U}from"../chunks/VY1jMpio.js";const j=!0,Et=Object.freeze(Object.defineProperty({__proto__:null,prerender:j},Symbol.toStringTag,{value:"Module"}));var G=y('<h3>About Locktime</h3> <p>Locktime allows locking coins (or CashTokens) until some future date.</p> <p><strong>⚠️ NOTE: All assets remain LOCKED until the specified time, with no early withdraws possible.</strong></p> <p>More about the <a href="https://bitcoincashresearch.org/t/unspent-phi-v3-timelocking-token-aware-contracts/1501#absolute-timelock-bip65-hodl-style-vault-with-cashtoken-support-1" rel="nofollow">contract here</a></p> <h3>See Also:</h3> <p>The <a href="https://github.com/mainnet-pat/hodl_ec_plugin" rel="nofollow">HODL Electron Cash plugin</a> by mainnet-pat (pat#111222)</p>',1);function $(k){var e=G();B(10),O(k,e)}const J="https://libauth.org/schemas/wallet-template-v0.schema.json",z="Locktime: A hodl-style locking contract",W="Locktime",Z={covenant:{description:"Lock coins (or tokens) until some later time. Assets may be automatically released from the vault if the parameters or the contract are published.",name:"Locktime Vault",scripts:["lock","unlock"],variables:{locktime:{description:"The absolute block time to lock assets until. May be a block in the past.",name:"Locktime",type:"WalletData"},recipient:{description:"Locking bytecode assets can be sent to when the locktime is reached.",name:"Recipient",type:"AddressData"}}}},tt={base:{data:{bytecode:{}},description:"",name:"Base Scenario"},release:{data:{bytecode:{locktime:"10",recipient:"0xa914e78564d75c446f8c00c757a2bd783d30c4f0819a87"}},description:"",extends:"base",name:"Release Assets",transaction:{inputs:[{unlockingBytecode:["slot"],sequenceNumber:10}],outputs:[{lockingBytecode:"a914e78564d75c446f8c00c757a2bd783d30c4f0819a87",valueSatoshis:800}],locktime:11,version:2},sourceOutputs:[{lockingBytecode:["slot"],valueSatoshis:800}]}},et={unlock:{passes:["release"],name:"Unlock",script:" // ",unlocks:"lock"},lock:{lockingType:"standard",name:"Locktime Covenant",script:`//
// A contract to hodl until a pre-defined block
// 
// contract Locktime(
<"U3L"> <recipient> <locktime> 
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
//}

OP_NIP`}},nt=["BCH_2026_05","BCH_SPEC"],ot={$schema:J,description:z,name:W,entities:Z,scenarios:tt,scripts:et,supported:nt},it="@unspent/locktime",st={name:it};class at{static USER_AGENT=st.name;static PROTOCOL_IDENTIFIER="U3L";static EXECUTOR_FEE=2500;static tokenAware=!0;static template=ot;static compiler=x(this.template);static vm=Q();static dataToBytecode(e){return{locktime:F(e.locktime),recipient:u(e.recipient)}}static parseCommitment(e){typeof e=="string"&&(e=u(e));const t=Y(e);if(M(t[0])!==this.PROTOCOL_IDENTIFIER)throw Error(`"Non-${typeof this} record NFT passed as ${typeof this}"`);return{recipient:t[1],locktime:t[2]}}static encodeCommitment(e){const t=this.dataToBytecode(e);return b(this.getLockingBytecode(t))}static getLockingBytecode(e){const t=this.compiler.generateBytecode({data:{bytecode:e},scriptId:"lock"});if(!t.success)throw new Error("Failed to generate bytecode, script: , "+JSON.stringify(t,null,"  "));return t.bytecode}static getScriptHash(e,t=!0){return X(this.getLockingBytecode(this.parseCommitment(e)),t)}static getAddress(e,t="bitcoincash"){let n=this.dataToBytecode(e);return V(this.getLockingBytecode(n),t,this.tokenAware)}static getSourceOutput(e,t){return{lockingBytecode:this.getLockingBytecode(e),valueSatoshis:BigInt(t.value),token:t.token_data?{category:u(t.token_data.category),amount:BigInt(t.token_data.amount),nft:t.token_data.nft?{commitment:u(t.token_data.nft.commitment),capability:t.token_data.nft.capability}:void 0}:void 0}}static getInput(e,t){return{outpointIndex:t.tx_pos,outpointTransactionHash:u(t.tx_hash),sequenceNumber:0,unlockingBytecode:{data:{bytecode:e},compiler:this.compiler,script:"unlock",valueSatoshis:BigInt(t.value),token:t.token_data?{category:u(t.token_data.category),amount:BigInt(t.token_data.amount),nft:t.token_data.nft?{commitment:u(t.token_data.nft.commitment),capability:t.token_data.nft.capability}:void 0}:void 0}}}static getDeposit(e,t){return{lockingBytecode:{data:{bytecode:e},compiler:this.compiler,script:"lock"},valueSatoshis:BigInt(t)}}static getOutput(e,t){let n=t.value>this.EXECUTOR_FEE+800?t.value-this.EXECUTOR_FEE:800n;return{lockingBytecode:e.recipient,valueSatoshis:BigInt(n),token:t.token_data?{category:u(t.token_data.category),amount:BigInt(t.token_data.amount),nft:t.token_data.nft?{commitment:u(t.token_data.nft.commitment),capability:t.token_data.nft.capability}:void 0}:void 0}}static getExecutorOutput(e,t){let n=q(e);if(typeof n=="string")throw n;return{lockingBytecode:n.bytecode,valueSatoshis:BigInt(t)}}static fund(e,t,n,p,m,d=1){const l=[],o=[];let i=[];typeof n!="string"&&(n=b(n));let h=this.dataToBytecode({locktime:t,recipient:n}),a={locktime:0,version:2,inputs:l,outputs:o};a.outputs.push(this.getDeposit(h,e)),a=H(a,i,p,m);let s=f(a);if(!s.success)throw new Error("generate transaction failed!, errors: "+U(s.errors));let c=s.transaction;const r=P(s.transaction,d),E=a.outputs.length-1;if(a.outputs[E].valueSatoshis=a.outputs[E].valueSatoshis-r,s=f(a),!s.success)throw new Error("generate transaction failed!, errors: "+U(s.errors));c=s.transaction;const _=N(c,i,{maximumTokenCommitmentLength:128});if(_!==!0)throw _;let g=this.vm.verify({sourceOutputs:i,transaction:c});if(typeof g=="string")throw g;return{sourceOutputs:i,transaction:c,verify:g}}static execute(e,t,n,p=1){const m=[],d=[];let l=[],o={locktime:t,version:2,inputs:m,outputs:d};for(let c of e){let r=this.parseCommitment(c.record);K(r.locktime)<=t&&(o.inputs.push(this.getInput(r,c.utxo)),o.outputs.push(this.getOutput(r,c.utxo)),l.push(this.getSourceOutput(r,c.utxo)))}n&&o.inputs.length>0&&o.outputs.push(this.getExecutorOutput(n,o.inputs.length*this.EXECUTOR_FEE));let i=f(o);if(!i.success)throw new Error("generate transaction failed!, errors: "+JSON.stringify(i.errors,null,"  "));if(n&&o.inputs.length>0){const c=P(i.transaction,p)+1n,r=o.outputs.length-1;o.outputs[r].valueSatoshis=o.outputs[r].valueSatoshis-c}if(i=f(o),!i.success)throw new Error("generate transaction failed!, errors: "+JSON.stringify(i.errors,null,"  "));const h=i.transaction,a=N(h,l,{maximumTokenCommitmentLength:40});if(a!==!0)throw a;let s=this.vm.verify({sourceOutputs:l,transaction:h});if(typeof s=="string")throw s;return{sourceOutputs:l,transaction:h,verify:s}}}var ct=y('<img alt="Disconnected"/>'),rt=y('<section><div class="status svelte-1hdjt3z"><!> <!></div> <!></section>');function _t(k,e){L(e,!0);var t=rt(),n=T(t),p=T(n);S(p,{get template(){return at.template}});var m=I(p,2);{var d=o=>{var i=ct();w(()=>R(i,"src",D)),O(o,i)};A(m,o=>{o(d,-1)})}v(n);var l=I(n,2);$(l),v(t),O(k,t),C()}export{_t as component,Et as universal};
//# sourceMappingURL=13.Bu24LhkM.js.map
