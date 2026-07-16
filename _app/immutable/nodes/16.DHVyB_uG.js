import{f as d,a as l}from"../chunks/BQ8W2y5r.js";import{aI as k,p as g,a as b,c as f,s as O,r as _,t as P}from"../chunks/5yJvB4cG.js";import{i as T}from"../chunks/C92i--r8.js";import{a as y}from"../chunks/DXPSGXEJ.js";import"../chunks/Bx2aHIrS.js";import{B as E}from"../chunks/DiEBMA-_.js";import{D as I}from"../chunks/DMvn4Q5j.js";import{i as v,h as i,G as N,t as U,k as w,l as B,m as C,v as A,b as R,B as S}from"../chunks/D6NMCXg_.js";import{d as L}from"../chunks/NPSzfOGJ.js";import{c as D}from"../chunks/BESLs7BN.js";const x=!0,ut=Object.freeze(Object.defineProperty({__proto__:null,prerender:x},Symbol.toStringTag,{value:"Module"}));var F=d('<h3>About Timeout</h3> <p>A timeout contract holds assets (cash or tokens) during a timeout period. If not withdrawn or ‘refreshed’ within the timeout window, all funds will be sent to the pre-defined receipt.</p> <p><strong>⚠️ Note: Funds will be sent to the pre-defined receipt if not moved BEFORE timeout expires.</strong></p> <p>More about the <a href="https://bitcoincashresearch.org/t/unspent-phi-v3-timelocking-token-aware-contracts/1501#relative-timelock-bip68-deadman-switch-or-last-will-vault-with-cashtoken-support-2" rel="nofollow">contract here</a></p> <h3>See also:</h3> <p><a href="https://github.com/KarolTrzeszczkowski/Electron-Cash-Last-Will-Plugin" rel="nofollow">Last Will</a> by Karol Trzeszczkowski (Licho#14431)</p>',1);function M(p){var e=F();k(10),l(p,e)}const X="https://libauth.org/schemas/wallet-template-v0.schema.json",V='Timeout: a "deadman"-style asset vault.',q="Timeout",H={covenant:{description:`Lock assets on a deadman timeout. 

If assets are left dormant for too long without being refreshed, this contract allows them to be sent to a predefined receipt. Parameters of the contract are published MUST be published publicly (at some point) to allow anyone to forward the assets to the pre-defined receipt.`,name:"Timeout Vault",scripts:["lock","unlock"],variables:{auth:{description:"CashToken Category of the NFT series administering the timeout Vault.",name:"Authentication Token Category",type:"WalletData"},timeout:{description:"The relative time (in blocks) between refreshes.",name:"Timeout",type:"WalletData"},recipient:{description:"Where assets can be sent to when the timeout is passed.",name:"Recipient",type:"AddressData"},key:{description:"The private key that controls an admin wallet.",name:"Key",type:"HdKey"}}}},K={base:{data:{bytecode:{auth:"0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",timeout:"10",recipient:"0xa914e78564d75c446f8c00c757a2bd783d30c4f0819a87"}},description:"",name:"Base Scenario"},release:{description:"Send assets to receipt without special authorization",extends:"base",name:"Release assets after the timeout",transaction:{inputs:[{unlockingBytecode:["slot"],sequenceNumber:10}],outputs:[{lockingBytecode:"a914e78564d75c446f8c00c757a2bd783d30c4f0819a87",valueSatoshis:800}],version:2},sourceOutputs:[{lockingBytecode:["slot"],valueSatoshis:800}]},withdraw:{description:"",extends:"base",name:"Withdraw with NFT",transaction:{inputs:[{unlockingBytecode:{script:"wallet_unlock"}},{unlockingBytecode:["slot"],sequenceNumber:2}],outputs:[{lockingBytecode:"a914000000000000000000000000000000000000000087",valueSatoshis:100000800}],version:2},sourceOutputs:[{lockingBytecode:{script:"wallet_lock"},valueSatoshis:800,token:{category:"efbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbe",nft:{capability:"minting"}}},{lockingBytecode:["slot"],valueSatoshis:1e8}]}},Y={unlock:{passes:["release"],name:"Unlock",script:"OP_0",unlocks:"lock"},administer:{passes:["withdraw"],name:"Administer",script:"OP_1",unlocks:"lock"},wallet_unlock:{name:"Unlock",script:`<key.schnorr_signature.all_outputs>
<key.public_key>`,unlocks:"wallet_lock"},lock:{lockingType:"standard",name:"Timeout",script:`<"U3T"> <recipient>  <timeout> <auth> //
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
     OP_ELSE OP_4 OP_ROLL OP_1 OP_NUMEQUALVERIFY 
  // function administer() {

      // Authentication failed, script fails.
         OP_0 OP_UTXOTOKENCATEGORY OP_SWAP OP_2 OP_CAT OP_EQUAL  //
      // require(tx.inputs[0].tokenCategory == authCat + 0x02);
      
  // } 
  OP_NIP OP_NIP OP_NIP OP_ENDIF

`},wallet_lock:{lockingType:"standard",name:"P2PKH Lock",script:`OP_DUP
OP_HASH160 <$(<key.public_key> OP_HASH160
)> OP_EQUALVERIFY
OP_CHECKSIG`}},Q=["BCH_2026_05","BCH_SPEC"],z={$schema:X,description:V,name:q,entities:H,scenarios:K,scripts:Y,supported:Q},W="@unspent/timeout",G={name:W};class ${static PROTOCOL_IDENTIFIER="U3T";static USER_AGENT=G.name;static EXECUTOR_FEE=2500;static tokenAware=!0;static template=z;static compiler=v(this.template);static vm=D();static dataToBytecode(e){return{recipient:i(e.recipient),timeout:N(e.timeout),auth:i(e.auth)}}static parseCommitment(e){typeof e=="string"&&(e=i(e));const t=L(e);if(U(t[0])!==this.PROTOCOL_IDENTIFIER)throw Error(`"Non-${typeof this} record NFT passed as ${typeof this}"`);return{recipient:t[1],timeout:t[2],auth:t[3]}}static encodeCommitment(e){const t=this.dataToBytecode(e);return this.getLockingBytecode(t)}static getLockingBytecode(e){const t=this.compiler.generateBytecode({data:{bytecode:e},scriptId:"lock"});if(!t.success)throw new Error("Failed to generate bytecode, script: , "+JSON.stringify(t,null,"  "));return t.bytecode}static getScriptHash(e,t=!0){return w(this.getLockingBytecode(e),t)}static getAddress(e,t="bitcoincash"){return B(this.getLockingBytecode(e),t,this.tokenAware)}static getSourceOutput(e,t){return{lockingBytecode:this.getLockingBytecode(e),valueSatoshis:BigInt(t.value),token:t.token_data?{category:i(t.token_data.category),amount:BigInt(t.token_data.amount),nft:t.token_data.nft?{commitment:i(t.token_data.nft.commitment),capability:t.token_data.nft.capability}:void 0}:void 0}}static getInput(e,t){return{outpointIndex:t.tx_pos,outpointTransactionHash:i(t.tx_hash),sequenceNumber:t.value,unlockingBytecode:{data:{bytecode:e},compiler:this.compiler,script:"unlock",valueSatoshis:BigInt(t.value)}}}static getOutput(e,t){return{lockingBytecode:e.recipient,valueSatoshis:BigInt(t.value-this.EXECUTOR_FEE),token:t.token_data?{category:i(t.token_data.category),amount:BigInt(t.token_data.amount),nft:t.token_data.nft?{commitment:i(t.token_data.nft.commitment),capability:t.token_data.nft.capability}:void 0}:void 0}}static getSourceOutputs(e,t){const n=[];return n.push(...t.map(s=>this.getSourceOutput(e,s))),n}static process(e,t){let r={locktime:0,version:2,inputs:[],outputs:[]},c=this.parseCommitment(e);r.inputs.push(this.getInput(c,t)),r.outputs.push(this.getOutput(c,t));let u=C(r);if(!u.success)throw new Error("generate transaction failed!, errors: "+JSON.stringify(u.errors,null,"  "));const a=[this.getSourceOutput(c,t)],o=u.transaction,m=A(o,a,{maximumTokenCommitmentLength:40});if(m!==!0)throw m;let h=this.vm.verify({sourceOutputs:a,transaction:o});if(typeof h=="string")throw h;return R(S(o))}}var j=d('<img alt="Disconnected"/>'),J=d('<section><div class="status svelte-15is90k"><!> <!></div> <!></section>');function pt(p,e){g(e,!0);var t=J(),n=f(t),s=f(n);E(s,{get template(){return $.template}});var r=O(s,2);{var c=a=>{var o=j();P(()=>y(o,"src",I)),l(a,o)};T(r,a=>{a(c,-1)})}_(n);var u=O(n,2);M(u),_(t),l(p,t),b()}export{pt as component,ut as universal};
//# sourceMappingURL=16.DHVyB_uG.js.map
