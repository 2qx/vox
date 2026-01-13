import{f as h,a as p}from"../chunks/DTc5U4eY.js";import{aA as b,p as P,a as _,c as m,s as f,r as O,t as k}from"../chunks/CQU5mOuk.js";import{i as T}from"../chunks/CZ0rTjPC.js";import{s as y}from"../chunks/-rOGAMhN.js";import"../chunks/CuzQ0eOn.js";import{B as I}from"../chunks/BzLj6JBc.js";import{D as E}from"../chunks/DMvn4Q5j.js";import{g as v,h as l,r as N,w as g,d as w,e as U,f as B,v as A,b as C,k as x}from"../chunks/BQUio51k.js";import{c as S}from"../chunks/DGwzT_kg.js";const R=!0,re=Object.freeze(Object.defineProperty({__proto__:null,prerender:R},Symbol.toStringTag,{value:"Module"}));var L=h('<h3>About Timeout</h3> <p>A timeout contract holds assets (cash or tokens) during a timeout period. If not withdrawn or ‘refreshed’ within the timeout window, all funds will be sent to the pre-defined receipt.</p> <p><strong>⚠️ Note: Funds will be sent to the pre-defined receipt if not moved BEFORE timeout expires.</strong></p> <p>More about the <a href="https://bitcoincashresearch.org/t/unspent-phi-v3-timelocking-token-aware-contracts/1501#relative-timelock-bip68-deadman-switch-or-last-will-vault-with-cashtoken-support-2" rel="nofollow">contract here</a></p> <h3>See also:</h3> <p><a href="https://github.com/KarolTrzeszczkowski/Electron-Cash-Last-Will-Plugin" rel="nofollow">Last Will</a> by Karol Trzeszczkowski (Licho#14431)</p>',1);function D(c){var t=L();b(10),p(c,t)}const F="https://libauth.org/schemas/wallet-template-v0.schema.json",q='Timeout: a "deadman"-style asset vault.',M="Timeout",V={covenant:{description:`Lock assets on a deadman timeout. 

If assets are left dormant for too long without being refreshed, this contract allows them to be sent to a predefined receipt. Parameters of the contract are published MUST be published publicly (at some point) to allow anyone to forward the assets to the pre-defined receipt.`,name:"Timeout Vault",scripts:["lock","unlock"],variables:{auth:{description:"CashToken Category of the NFT series administering the timeout Vault.",name:"Authentication Token Category",type:"WalletData"},timeout:{description:"The relative time (in blocks) between refreshes.",name:"Timeout",type:"WalletData"},recipient:{description:"Where assets can be sent to when the timeout is passed.",name:"Recipient",type:"AddressData"},key:{description:"The private key that controls an admin wallet.",name:"Key",type:"HdKey"}}}},H={base:{description:"",name:"Base Scenario",data:{bytecode:{auth:"0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",timeout:"10",recipient:"0xa914e78564d75c446f8c00c757a2bd783d30c4f0819a87"}}},release:{description:"Send assets to receipt without special authorization",extends:"base",name:"Release assets after the timeout",transaction:{inputs:[{unlockingBytecode:["slot"],sequenceNumber:10}],outputs:[{lockingBytecode:"a914e78564d75c446f8c00c757a2bd783d30c4f0819a87",valueSatoshis:800}],version:2},sourceOutputs:[{lockingBytecode:["slot"],valueSatoshis:800}]},withdraw:{description:"",extends:"base",name:"Withdraw with NFT",transaction:{inputs:[{unlockingBytecode:{script:"wallet_unlock"}},{unlockingBytecode:["slot"],sequenceNumber:2}],outputs:[{lockingBytecode:"a914000000000000000000000000000000000000000087",valueSatoshis:100000800}],version:2},sourceOutputs:[{lockingBytecode:{script:"wallet_lock"},valueSatoshis:800,token:{category:"efbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbe",nft:{capability:"minting"}}},{lockingBytecode:["slot"],valueSatoshis:1e8}]}},K={unlock:{passes:["release"],name:"Unlock",script:"OP_0",unlocks:"lock"},administer:{passes:["withdraw"],name:"Administer",script:"OP_1",unlocks:"lock"},lock:{lockingType:"p2sh32",name:"Timeout",script:`<recipient>  <timeout> <auth> //
// contract Timeout(

//   // Category of the authenticating baton
//   // The auth baton is managed by the wallet of the user, 
//   // The contract is agnostic of the token paid to the receipt.
//   bytes32 authCat,

//   // length of time (blocks) to lock utxos 
//   int timeout,

//   // LockingBytecode of the beneficiary, the address receiving payments
//   bytes recipientLockingBytecode

// ) {

   OP_3 OP_PICK OP_0 OP_NUMEQUAL OP_IF 
  //function execute() {

//  Require version 2 for BIP68 support
    OP_TXVERSION OP_2 OP_NUMEQUALVERIFY
//  require(tx.version == 2);

//  Check that time has passed and that time locks are enabled
    OP_SWAP OP_CHECKSEQUENCEVERIFY OP_DROP 
//  require(tx.age >= timeout, "must satisfy age (bip68)");

//  Check that each output sends to the recipient
    OP_INPUTINDEX OP_OUTPUTBYTECODE OP_ROT OP_EQUALVERIFY 
//  require(tx.outputs[this.activeInputIndex].lockingBytecode == recipientLockingBytecode);

//  Check that each output sends the balance minus an executor allowance
    OP_INPUTINDEX OP_OUTPUTVALUE OP_INPUTINDEX OP_UTXOVALUE <2500> OP_SUB OP_GREATERTHANOREQUAL OP_VERIFY
//  require(tx.outputs[this.activeInputIndex].value >= tx.inputs[this.activeInputIndex].value - 2500);

//  Require tokens go forward
    OP_INPUTINDEX OP_OUTPUTTOKENAMOUNT OP_INPUTINDEX OP_UTXOTOKENAMOUNT OP_NUMEQUALVERIFY 
//  require(tx.outputs[this.activeInputIndex].tokenAmount == tx.inputs[this.activeInputIndex].tokenAmount);

//  Require the token is of the same category
    OP_INPUTINDEX OP_OUTPUTTOKENCATEGORY OP_INPUTINDEX OP_UTXOTOKENCATEGORY OP_EQUALVERIFY 
//  require(tx.outputs[this.activeInputIndex].tokenCategory == tx.inputs[this.activeInputIndex].tokenCategory, "must be same token");

//  Require the NFT commitment is passed on, if it exists
    OP_INPUTINDEX OP_OUTPUTTOKENCOMMITMENT OP_INPUTINDEX OP_UTXOTOKENCOMMITMENT OP_EQUAL
// require(tx.outputs[this.activeInputIndex].nftCommitment == tx.inputs[this.activeInputIndex].nftCommitment, "must pass NFT");
        
// } 
    OP_NIP OP_NIP

  // Allow refreshing, or withdraw, with the authentication baton
     OP_ELSE OP_3 OP_ROLL OP_1 OP_NUMEQUALVERIFY 
  // function administer() {

      // Authentication failed, script fails.
         OP_0 OP_UTXOTOKENCATEGORY OP_SWAP OP_2 OP_CAT OP_EQUAL  //
      // require(tx.inputs[0].tokenCategory == authCat + 0x02);
      
  // } 
  OP_NIP OP_NIP OP_ENDIF

`},wallet_unlock:{name:"Unlock",script:`<key.schnorr_signature.all_outputs>
<key.public_key>`,unlocks:"wallet_lock"},wallet_lock:{lockingType:"standard",name:"P2PKH Lock",script:`OP_DUP
OP_HASH160 <$(<key.public_key> OP_HASH160
)> OP_EQUALVERIFY
OP_CHECKSIG`}},X=["BCH_2023_05","BCH_SPEC"],Y=0,Q={$schema:F,description:q,name:M,entities:V,scenarios:H,scripts:K,supported:X,version:Y},z="@unspent/timeout",W={name:z};class j{static USER_AGENT=W.name;static tokenAware=!0;static template=Q;static compiler=v(this.template);static vm=S();static dataToBytecode(t){return{recipient:l(t.recipient),timeout:N(t.timeout),auth:l(t.auth)}}static dataToCommitmentRecord(t){const e=this.dataToBytecode(t);return Uint8Array.from([...g(e.recipient),...g(e.timeout)])}static getLockingBytecode(t){const e=this.compiler.generateBytecode({data:{bytecode:this.dataToBytecode(t)},scriptId:"lock"});if(!e.success)throw new Error("Failed to generate bytecode, script: , "+JSON.stringify(e,null,"  "));return e.bytecode}static getUnlockingBytecode(t){const e=this.compiler.generateBytecode({data:{bytecode:this.dataToBytecode(t)},scriptId:"unlock"});if(!e.success)throw new Error("Failed to generate bytecode, script: , "+JSON.stringify(e,null,"  "));return e.bytecode}static getScriptHash(t,e=!0){return w(this.getLockingBytecode(t),e)}static getAddress(t,e="bitcoincash"){return U(this.getLockingBytecode(t),e,this.tokenAware)}static getSourceOutput(t,e){return{lockingBytecode:this.getLockingBytecode(t),valueSatoshis:BigInt(e.value)}}static getInput(t,e){return{outpointIndex:e.tx_pos,outpointTransactionHash:l(e.tx_hash),sequenceNumber:e.value,unlockingBytecode:{data:{bytecode:this.dataToBytecode(t)},compiler:this.compiler,script:"unlock",valueSatoshis:BigInt(e.value)}}}static getOutput(){return{lockingBytecode:{data:{},compiler:this.compiler,script:"op_return"},valueSatoshis:BigInt(0)}}static getSourceOutputs(t,e){const n=[];return n.push(...e.map(i=>this.getSourceOutput(t,i))),n}static liquidate(t,e){let s={locktime:0,version:2,inputs:[],outputs:[]};s.inputs.push(this.getInput(t,e)),s.outputs.push(this.getOutput());let a=B(s);if(!a.success)throw new Error("generate transaction failed!, errors: "+JSON.stringify(a.errors,null,"  "));const u=[this.getSourceOutput(t,e)],o=a.transaction,r=A(o,u,{maximumTokenCommitmentLength:40});if(r!==!0)throw r;let d=this.vm.verify({sourceOutputs:u,transaction:o});if(typeof d=="string")throw d;return C(x(o))}}var G=h('<img alt="Disconnected"/>'),$=h('<section><div class="status svelte-1jejjaq"><!> <!></div> <!></section>');function ce(c,t){P(t,!0);var e=$(),n=m(e),i=m(n);I(i,{get template(){return j.template}});var s=f(i,2);{var a=o=>{var r=G();k(()=>y(r,"src",E)),p(o,r)};T(s,o=>{o(a,!1)})}O(n);var u=f(n,2);D(u),O(e),p(c,e),_()}export{ce as component,re as universal};
//# sourceMappingURL=15.DGtZ43x5.js.map
