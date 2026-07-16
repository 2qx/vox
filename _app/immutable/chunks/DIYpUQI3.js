import{i as T,h as m,b as y,t as P,k as v,w as _,x as N,m as l,q as E,v as k,y as R}from"./D6NMCXg_.js";import{d as x}from"./NPSzfOGJ.js";import{s as I}from"./VY1jMpio.js";import{c as U}from"./Cm9ccv02.js";const B="https://libauth.org/schemas/wallet-template-v0.schema.json",D="Pay one percent of a fund monthly in perpetuity",b="Perpetuity",L={trust:{description:"Contract creation and function trust",name:"Trust configuration",scripts:["lock","unlock"],variables:{recipient:{description:"Locking bytecode receiving payments",name:"recipientLockingBytecode",type:"WalletData"}}}},A={installment:{data:{bytecode:{recipient:"0xa914e78564d75c446f8c00c757a2bd783d30c4f0819a87"}},description:"Pay a monthly installment.",name:"Installment",transaction:{inputs:[{outpointTransactionHash:"dead00000000000000000000000000000000000000000000000000000000beef",outpointIndex:0,unlockingBytecode:["slot"],sequenceNumber:4383}],outputs:[{lockingBytecode:"a914e78564d75c446f8c00c757a2bd783d30c4f0819a87",valueSatoshis:1e5},{lockingBytecode:{},valueSatoshis:9899950}],version:2},sourceOutputs:[{lockingBytecode:["slot"],valueSatoshis:1e7}]}},S={unlock:{passes:["installment"],name:"unlock",script:`// 
// none
`,unlocks:"lock"},lock:{lockingType:"standard",name:"lock",script:`// "Perpetuity" contract constructor parameters
<"U3P"> <recipient> 

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
  OP_OUTPUTVALUE OP_INPUTINDEX OP_UTXOVALUE <9_899> OP_MUL <10_000> OP_DIV OP_GREATERTHANOREQUAL OP_VERIFY
  // require(tx.outputs[outIndex].value >= tx.inputs[this.activeInputIndex].value*9899/10000);
 
// }
//}

OP_DROP  OP_1 `}},w=["BCH_2026_05"],C={$schema:B,description:D,name:b,entities:L,scenarios:A,scripts:S,supported:w},V="@unspent/trust",F={name:V};class Q{static USER_AGENT=F.name;static PROTOCOL_IDENTIFIER="U3P";static VERSION="1.0.0";static tokenAware=!1;static template=C;static compiler=T(this.template);static vm=U();static PERIOD=4383;static INSTALLMENT_DENOMINATOR=100;static RETURN_NUMERATOR=9899;static RETURN_DENOMINATOR=1e4;static dataToBytecode(e){return{recipient:m(e.recipient)}}static bytecodeToData(e){return{recipient:y(e.recipient)}}static parseCommitment(e){typeof e=="string"&&(e=m(e));const t=x(e);if(P(t[0])!==this.PROTOCOL_IDENTIFIER)throw Error(`"Non-${this.name} record NFT passed as ${this.name}"`);return{recipient:t[1]}}static encodeCommitment(e){const t=this.dataToBytecode(e);return y(this.getLockingBytecode(t))}static getLockingBytecode(e){const t=this.compiler.generateBytecode({data:{bytecode:e},scriptId:"lock"});if(!t.success)throw new Error("Failed to generate bytecode, script: , "+I(t));return t.bytecode}static getScriptHash(e,t=!0){return v(this.getLockingBytecode(this.parseCommitment(e)),t)}static getAddress(){throw Error("No Cashaddr for p2s contract type")}static getSourceOutput(e,t){return{lockingBytecode:this.getLockingBytecode(e),valueSatoshis:BigInt(t.value)}}static getInstallmentOutput(e,t){let s=Math.round(t.value/this.INSTALLMENT_DENOMINATOR);return{lockingBytecode:e.recipient,valueSatoshis:BigInt(s)}}static getDepositOutput(e,t){return{lockingBytecode:{data:{bytecode:e},compiler:this.compiler,script:"lock"},valueSatoshis:BigInt(t)}}static getReturnOutput(e,t){let s=Math.round(t.value*this.RETURN_NUMERATOR/this.RETURN_DENOMINATOR);return{lockingBytecode:{data:{bytecode:e},compiler:this.compiler,script:"lock"},valueSatoshis:BigInt(s)}}static getExecutorOutput(e,t){let s=_(e);if(typeof s=="string")throw s;return{lockingBytecode:s.bytecode,valueSatoshis:t}}static getInput(e,t,s=this.PERIOD){return{outpointIndex:t.tx_pos,outpointTransactionHash:m(t.tx_hash),sequenceNumber:s,unlockingBytecode:{data:{bytecode:e},compiler:this.compiler,script:"unlock",valueSatoshis:BigInt(t.value)}}}static fund(e,t,s,h,d=1){const O=[],u=[];let o=[];typeof t!="string"&&(t=y(t));let c=this.dataToBytecode({recipient:t}),i={locktime:0,version:2,inputs:O,outputs:u};i.outputs.push(this.getDepositOutput(c,e)),i=N(i,o,s,h);let a=l(i);if(!a.success)throw new Error("generate transaction failed!, errors: "+I(a.errors));let n=a.transaction;const r=E(a.transaction,d),p=i.outputs.length-1;if(i.outputs[p].valueSatoshis=i.outputs[p].valueSatoshis-r,a=l(i),!a.success)throw new Error("generate transaction failed!, errors: "+JSON.stringify(a.errors,null,"  "));n=a.transaction;const f=k(n,o,{maximumTokenCommitmentLength:128});if(f!==!0)throw f;let g=this.vm.verify({sourceOutputs:o,transaction:n});if(typeof g=="string")throw g;return{sourceOutputs:o,transaction:n,verify:g}}static execute(e,t,s,h=1){const d=[],O=[];let u=[];const o={locktime:0,version:2,inputs:d,outputs:O};for(let n of e){let r=this.parseCommitment(n.record);n.utxo.height>0&&t-n.utxo.height>=this.PERIOD&&(o.inputs.push(this.getInput(r,n.utxo,this.PERIOD)),o.outputs.push(this.getInstallmentOutput(r,n.utxo)),u.push(this.getSourceOutput(r,n.utxo)))}for(let n of e){let r=this.parseCommitment(n.record);n.utxo.height>0&&t-n.utxo.height>=this.PERIOD&&o.outputs.push(this.getReturnOutput(r,n.utxo))}if(s){let n=-R(u,o.outputs);console.log(n),n>0&&o.outputs.push(this.getExecutorOutput(s,n))}let c=l(o);if(!c.success)throw new Error("generate transaction failed!, errors: "+I(c.errors));let i=c.transaction;if(s){const n=E(c.transaction,h)+1n;console.log(n);const r=o.outputs.length-1;o.outputs[r].valueSatoshis=o.outputs[r].valueSatoshis-n}if(c=l(o),!c.success)throw new Error("generate transaction failed!, errors: "+JSON.stringify(c.errors,null,"  "));i=c.transaction;let a=this.vm.verify({sourceOutputs:u,transaction:i});if(typeof a=="string")throw a;return{sourceOutputs:u,transaction:i,verify:a}}}export{Q as T};
//# sourceMappingURL=DIYpUQI3.js.map
