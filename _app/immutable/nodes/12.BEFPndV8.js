import{f as g,a as k}from"../chunks/CGwnhXb4.js";import{aA as y,p as I,a as b,c as O,s as T,r as E,t as v}from"../chunks/BOvxcHb_.js";import{i as N}from"../chunks/5HhJkChQ.js";import{a as P}from"../chunks/BoXlra0R.js";import"../chunks/DOlhhP5A.js";import{B as U}from"../chunks/C-TNoLC1.js";import{D as B}from"../chunks/DMvn4Q5j.js";import{g as L,h as i,B as C,C as A,D as R,b as w,j as D,k as S,r as F,a as M,l as _,p as X,v as x}from"../chunks/DmPc9vAL.js";import{d as V}from"../chunks/DoqPxidZ.js";import{c as q}from"../chunks/BbGpFpOA.js";const H=!0,gt=Object.freeze(Object.defineProperty({__proto__:null,prerender:H},Symbol.toStringTag,{value:"Module"}));var K=g('<h3>About Locktime</h3> <p>Locktime allows locking coins (or CashTokens) until some future date.</p> <p><strong>⚠️ NOTE: All assets remain LOCKED until the specified time, with no early withdraws possible.</strong></p> <p>More about the <a href="https://bitcoincashresearch.org/t/unspent-phi-v3-timelocking-token-aware-contracts/1501#absolute-timelock-bip65-hodl-style-vault-with-cashtoken-support-1" rel="nofollow">contract here</a></p> <h3>See Also:</h3> <p>The <a href="https://github.com/mainnet-pat/hodl_ec_plugin" rel="nofollow">HODL Electron Cash plugin</a> by mainnet-pat (pat#111222)</p>',1);function Y(u){var e=K();y(10),k(u,e)}const j="https://libauth.org/schemas/wallet-template-v0.schema.json",$="Locktime: A hodl-style locking contract",Q="Locktime",G={covenant:{description:"Lock coins (or tokens) until some later time. Assets may be automatically released from the vault if the parameters or the contract are published.",name:"Locktime Vault",scripts:["lock","unlock"],variables:{locktime:{description:"The absolute block time to lock assets until. May be a block in the past.",name:"Locktime",type:"WalletData"},recipient:{description:"Locking bytecode assets can be sent to when the locktime is reached.",name:"Recipient",type:"AddressData"}}}},J={base:{data:{bytecode:{}},description:"",name:"Base Scenario"},release:{data:{bytecode:{locktime:"10",recipient:"0xa914e78564d75c446f8c00c757a2bd783d30c4f0819a87"}},description:"",extends:"base",name:"Release Assets",transaction:{inputs:[{unlockingBytecode:["slot"],sequenceNumber:10}],outputs:[{lockingBytecode:"a914e78564d75c446f8c00c757a2bd783d30c4f0819a87",valueSatoshis:800}],locktime:11,version:2},sourceOutputs:[{lockingBytecode:["slot"],valueSatoshis:800}]}},z={unlock:{passes:["release"],name:"Unlock",script:" // ",unlocks:"lock"},lock:{lockingType:"standard",name:"Locktime Covenant",script:`//
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
//}`}},W=["BCH_2023_05","BCH_SPEC"],Z=0,tt={$schema:j,description:$,name:Q,entities:G,scenarios:J,scripts:z,supported:W,version:Z},et="@unspent/locktime",nt={name:et};class ot{static USER_AGENT=nt.name;static PROTOCOL_IDENTIFIER="U3L";static EXECUTOR_FEE=2500;static tokenAware=!0;static template=tt;static compiler=L(this.template);static vm=q();static dataToBytecode(e){return{locktime:C(e.locktime),recipient:i(e.recipient)}}static parseNFT(e){if(e.token_data?.nft?.commitment){let t=V(i(e.token_data?.nft?.commitment));if(A(t[0])!==this.PROTOCOL_IDENTIFIER)throw Error("Non-locktime record NFT passed as locktime");return{recipient:t[1],locktime:t[2]}}else throw Error("Could not parse locktime NFT")}static encodeCommitment(e){let t=R(`<"${this.PROTOCOL_IDENTIFIER}"><0x${e.recipient}><${e.locktime}>`);if(typeof t=="string")throw t;return w(t)}static getLockingBytecode(e){const t=this.compiler.generateBytecode({data:{bytecode:e},scriptId:"lock"});if(!t.success)throw new Error("Failed to generate bytecode, script: , "+JSON.stringify(t,null,"  "));return t.bytecode}static getScriptHash(e,t=!0){return D(this.getLockingBytecode(this.parseNFT(e)),t)}static getAddress(e,t="bitcoincash"){let n=this.dataToBytecode(e);return S(this.getLockingBytecode(n),t,this.tokenAware)}static getSourceOutput(e,t){return{lockingBytecode:this.getLockingBytecode(e),valueSatoshis:BigInt(t.value),token:t.token_data?{category:i(t.token_data.category),amount:BigInt(t.token_data.amount),nft:t.token_data.nft?{commitment:i(t.token_data.nft.commitment),capability:t.token_data.nft.capability}:void 0}:void 0}}static getInput(e,t){return{outpointIndex:t.tx_pos,outpointTransactionHash:i(t.tx_hash),sequenceNumber:0,unlockingBytecode:{data:{bytecode:e},compiler:this.compiler,script:"unlock",valueSatoshis:BigInt(t.value),token:t.token_data?{category:i(t.token_data.category),amount:BigInt(t.token_data.amount),nft:t.token_data.nft?{commitment:i(t.token_data.nft.commitment),capability:t.token_data.nft.capability}:void 0}:void 0}}}static getOutput(e,t){let n=t.value>this.EXECUTOR_FEE+800?t.value-this.EXECUTOR_FEE:800n;return{lockingBytecode:e.recipient,valueSatoshis:BigInt(n),token:t.token_data?{category:i(t.token_data.category),amount:BigInt(t.token_data.amount),nft:t.token_data.nft?{commitment:i(t.token_data.nft.commitment),capability:t.token_data.nft.capability}:void 0}:void 0}}static getExecutorOutput(e,t){let n=F(e);if(typeof n=="string")throw n;return{lockingBytecode:n.bytecode,valueSatoshis:BigInt(t)}}static execute(e,t,n,l=1){const p=[],m=[];let c=[],o={locktime:t,version:2,inputs:p,outputs:m};for(let r of e){let s=this.parseNFT(r.record);M(s.locktime)<=t&&(o.inputs.push(this.getInput(s,r.utxo)),o.outputs.push(this.getOutput(s,r.utxo)),c.push(this.getSourceOutput(s,r.utxo)))}n&&o.inputs.length>0&&o.outputs.push(this.getExecutorOutput(n,o.inputs.length*this.EXECUTOR_FEE));let a=_(o);if(!a.success)throw new Error("generate transaction failed!, errors: "+JSON.stringify(a.errors,null,"  "));if(n&&o.inputs.length>0){const r=X(a.transaction,l)+1n,s=o.outputs.length-1;o.outputs[s].valueSatoshis=o.outputs[s].valueSatoshis-r}if(a=_(o),!a.success)throw new Error("generate transaction failed!, errors: "+JSON.stringify(a.errors,null,"  "));const d=a.transaction,f=x(d,c,{maximumTokenCommitmentLength:40});if(f!==!0)throw f;let h=this.vm.verify({sourceOutputs:c,transaction:d});if(typeof h=="string")throw h;return{sourceOutputs:c,transaction:d,verify:h}}}var at=g('<img alt="Disconnected"/>'),it=g('<section><div class="status svelte-1jejjaq"><!> <!></div> <!></section>');function ft(u,e){I(e,!0);var t=it(),n=O(t),l=O(n);U(l,{get template(){return ot.template}});var p=T(l,2);{var m=o=>{var a=at();v(()=>P(a,"src",B)),k(o,a)};N(p,o=>{o(m,!1)})}E(n);var c=T(n,2);Y(c),E(t),k(u,t),b()}export{ft as component,gt as universal};
//# sourceMappingURL=12.BEFPndV8.js.map
