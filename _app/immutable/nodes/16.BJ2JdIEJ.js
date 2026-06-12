import{f as I,a as g}from"../chunks/Dpugy2Ee.js";import{aA as v,p as N,a as k,c as T,s as E,r as _,t as R}from"../chunks/D4dX0kjQ.js";import{i as B}from"../chunks/TPC8Xsa-.js";import{a as x}from"../chunks/ClBgvd6y.js";import"../chunks/D1QZKn_k.js";import{B as U}from"../chunks/BDlQlwQW.js";import{D as b}from"../chunks/DMvn4Q5j.js";import{g as D,h as O,C as A,D as L,b as S,j as C,k as V,r as F,G as w,s as M,l as y,p as H,v as q}from"../chunks/DmPc9vAL.js";import{d as X}from"../chunks/DoqPxidZ.js";import{c as Y}from"../chunks/BbGpFpOA.js";import{s as P}from"../chunks/cu_YJrLQ.js";const j=!0,ft=Object.freeze(Object.defineProperty({__proto__:null,prerender:j},Symbol.toStringTag,{value:"Module"}));var Q=I('<h3>About Irrevocable Trusts</h3> <p>An unspent trust is a simple monthly annuity.</p> <p>Checkout the earlier version at <a href="https://unspent.cash" rel="nofollow">unspent.cash</a>.</p>',1);function $(c){var e=Q();v(4),g(c,e)}const G="https://libauth.org/schemas/wallet-template-v0.schema.json",z="Pay one percent of a fund monthly in perpetuity",J="Perpetuity",K={trust:{description:"Contract creation and function trust",name:"Trust configuration",scripts:["lock","unlock"],variables:{recipient:{description:"Locking bytecode receiving payments",name:"recipientLockingBytecode",type:"WalletData"}}}},W={installment:{data:{bytecode:{recipient:"0xa914e78564d75c446f8c00c757a2bd783d30c4f0819a87"}},description:"Pay a monthly installment.",name:"Installment",transaction:{inputs:[{outpointTransactionHash:"dead00000000000000000000000000000000000000000000000000000000beef",outpointIndex:0,unlockingBytecode:["slot"],sequenceNumber:4383}],outputs:[{lockingBytecode:"a914e78564d75c446f8c00c757a2bd783d30c4f0819a87",valueSatoshis:1e5},{lockingBytecode:{},valueSatoshis:9899950}],version:2},sourceOutputs:[{lockingBytecode:["slot"],valueSatoshis:1e7}]}},Z={unlock:{passes:["installment"],name:"unlock",script:`// 
// none
`,unlocks:"lock"},lock:{lockingType:"standard",name:"lock",script:`// "Perpetuity" contract constructor parameters
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
  <1> OP_CHECKSEQUENCEVERIFY OP_DROP 
  // require(this.age >= 4383);

  // Check that the first output sends to the recipient
  OP_INPUTINDEX OP_OUTPUTBYTECODE OP_EQUALVERIFY 
  // require(tx.outputs[this.activeInputIndex].lockingBytecode == recipientLockingBytecode);

  // Check that the output sends a normal installment
  OP_INPUTINDEX OP_OUTPUTVALUE OP_INPUTINDEX OP_UTXOVALUE <100> OP_DIV OP_GREATERTHANOREQUAL OP_VERIFY 
  // require(tx.outputs[this.activeInputIndex].value >= tx.inputs[this.activeInputIndex].value/100);
  
  // push the output index
  // which is the current input times two
  OP_INPUTINDEX OP_TXINPUTCOUNT OP_ADD OP_DUP
  // int outIndex = this.activeInputIndex + tx.inputs.length;
  
  // require the second output match the active bytecode
  OP_OUTPUTBYTECODE OP_INPUTINDEX OP_UTXOBYTECODE OP_EQUALVERIFY
  // require(tx.outputs[outIndex].lockingBytecode == tx.inputs[this.activeInputIndex].lockingBytecode);

  // balance was returned to the contract, minus 1/10,000ths for executor fee
  OP_OUTPUTVALUE OP_INPUTINDEX OP_UTXOVALUE <9_899> OP_MUL <10_000> OP_DIV OP_GREATERTHANOREQUAL OP_VERIFY OP_1 
  // require(tx.outputs[outIndex].value >= tx.inputs[this.activeInputIndex].value*9899/10000);
 
// }
//}`}},tt=["BCH_2022_05","BCH_2023_05","BCH_2024_05","BCH_2025_05","BCH_SPEC"],et={$schema:G,description:z,name:J,entities:K,scenarios:W,scripts:Z,supported:tt},nt="@unspent/trust",st={name:nt};class ot{static USER_AGENT=st.name;static PROTOCOL_IDENTIFIER="U3P";static VERSION="1.0.0";static tokenAware=!1;static template=et;static compiler=D(this.template);static vm=Y();static PERIOD=4383;static INSTALLMENT_DENOMINATOR=100;static RETURN_NUMERATOR=9899;static RETURN_DENOMINATOR=1e4;static dataToBytecode(e){return{recipient:O(e.recipient)}}static parseNFT(e){if(e.token_data?.nft?.commitment){let t=X(O(e.token_data?.nft?.commitment));if(A(t[0])!==this.PROTOCOL_IDENTIFIER)throw Error("Non-annuity record NFT passed as annuity");return{recipient:t[1]}}else throw Error("Could not parse annuity NFT")}static encodeCommitment(e){let t=L(`<"${this.PROTOCOL_IDENTIFIER}"><0x${e.recipient}>`);if(typeof t=="string")throw t;return S(t)}static getLockingBytecode(e){const t=this.compiler.generateBytecode({data:{bytecode:e},scriptId:"lock"});if(!t.success)throw new Error("Failed to generate bytecode, script: , "+P(t));return t.bytecode}static getScriptHash(e,t=!0){return C(this.getLockingBytecode(this.parseNFT(e)),t)}static getAddress(e,t="bitcoincash"){let n=this.dataToBytecode(e);return V(this.getLockingBytecode(n),t)}static getSourceOutput(e,t){return{lockingBytecode:this.getLockingBytecode(e),valueSatoshis:BigInt(t.value)}}static getInstallmentOutput(e,t){let n=Math.round(t.value/this.INSTALLMENT_DENOMINATOR);return{lockingBytecode:e.recipient,valueSatoshis:BigInt(n)}}static getReturnOutput(e,t){let n=Math.round(t.value*this.RETURN_NUMERATOR/this.RETURN_DENOMINATOR);return{lockingBytecode:{data:{bytecode:e},compiler:this.compiler,script:"lock"},valueSatoshis:BigInt(n)}}static getExecutorOutput(e,t){let n=F(e);if(typeof n=="string")throw n;return{lockingBytecode:n.bytecode,valueSatoshis:t}}static getInput(e,t,n=this.PERIOD){return{outpointIndex:t.tx_pos,outpointTransactionHash:O(t.tx_hash),sequenceNumber:n,unlockingBytecode:{data:{bytecode:e},compiler:this.compiler,script:"unlock",valueSatoshis:BigInt(t.value)}}}static execute(e,t,n,u=1){const h=[],d=[];let r=[];const s={locktime:0,version:2,inputs:h,outputs:d};for(let o of e){let a=this.parseNFT(o.record);o.utxo.height>0&&t-o.utxo.height>=this.PERIOD&&(s.inputs.push(this.getInput(a,o.utxo,this.PERIOD)),s.outputs.push(this.getInstallmentOutput(a,o.utxo)),r.push(this.getSourceOutput(a,o.utxo)))}for(let o of e){let a=this.parseNFT(o.record);o.utxo.height>0&&t-o.utxo.height>=this.PERIOD&&s.outputs.push(this.getReturnOutput(a,o.utxo))}if(n&&s.inputs.length>0){let o=w(s.outputs),l=M(r)-o;l>0&&s.outputs.push(this.getExecutorOutput(n,l))}let i=y(s);if(!i.success)throw new Error("generate transaction failed!, errors: "+P(i.errors));let p=i.transaction;if(n&&s.inputs.length>0){const o=H(i.transaction,u)+1n;console.log(o);const a=s.outputs.length-1;s.outputs[a].valueSatoshis=s.outputs[a].valueSatoshis-o}if(i=y(s),!i.success)throw new Error("generate transaction failed!, errors: "+JSON.stringify(i.errors,null,"  "));p=i.transaction;const f=q(p,r,{maximumTokenCommitmentLength:40});if(f!==!0)throw f;let m=this.vm.verify({sourceOutputs:r,transaction:p});if(typeof m=="string")throw m;return{sourceOutputs:r,transaction:p,verify:m}}}var it=I('<img alt="Disconnected"/>'),at=I('<section><div class="status svelte-1jejjaq"><!> <!></div> <!></section>');function Tt(c,e){N(e,!0);var t=at(),n=T(t),u=T(n);U(u,{get template(){return ot.template}});var h=E(u,2);{var d=s=>{var i=it();R(()=>x(i,"src",b)),g(s,i)};B(h,s=>{s(d,!1)})}_(n);var r=E(n,2);$(r),_(t),g(c,t),k()}export{Tt as component,ft as universal};
//# sourceMappingURL=16.BJ2JdIEJ.js.map
