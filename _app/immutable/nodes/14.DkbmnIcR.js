import{f as C,a as R}from"../chunks/CGwnhXb4.js";import{o as ot,a as rt}from"../chunks/CwGOPNE5.js";import{aA as ct,p as ut,aB as y,ao as M,a as lt,c as X,s as W,ak as b,w as d,r as Y,t as H}from"../chunks/BOvxcHb_.js";import{i as pt}from"../chunks/5HhJkChQ.js";import{a as F}from"../chunks/BoXlra0R.js";import{p as dt}from"../chunks/DVJriUZC.js";import"../chunks/DOlhhP5A.js";import{B as ht,t as mt}from"../chunks/BEj13CDf.js";import{B as ft}from"../chunks/C-TNoLC1.js";import{C as gt}from"../chunks/B7hCbxZp.js";import{D as Ot}from"../chunks/DMvn4Q5j.js";import{e as kt,L as _t,g as bt,m as K,h as P,C as yt,D as Tt,b as w,j as Z,M as N,r as tt,E as Pt,F as It,s as U,q as v,G as $,N as Q,O as z,a as q,l as B,p as G,v as j,P as Et,t as vt}from"../chunks/DmPc9vAL.js";import{d as Nt}from"../chunks/DoqPxidZ.js";import{e as J,C as Ut}from"../chunks/DxukWiye.js";import{I as wt,B as St,W as xt,T as Bt,a as At}from"../chunks/D4SYZdt6.js";const Rt=(I=!0)=>kt(_t(I)),Ct=!0,de=Object.freeze(Object.defineProperty({__proto__:null,prerender:Ct},Symbol.toStringTag,{value:"Module"}));var Dt=C('<h3>About Subscriptions</h3> <p>Setup subscriptions paying in CashTokens for regular payments to a pre-defined address.</p> <p>Subscribers can cancel at any time and withdraw the balance of the pre-paid fund using an NFT “key card”.</p> <p>More about the <a href="https://bitcoincashresearch.org/t/unspent-phi-v3-timelocking-token-aware-contracts/1501#subscriptions-share-vesting-revocable-token-annuities-3" rel="nofollow">contract here</a></p> <h3>See Also:</h3> <p><a href="https://github.com/KarolTrzeszczkowski/Mecenas-recurring-payment-EC-plugin" rel="nofollow">Mecenas</a> by Karol Trzeszczkowski (Licho#14431)</p>',1);function Lt(I){var e=Dt();ct(10),R(I,e)}const Ft="https://libauth.org/schemas/wallet-template-v0.schema.json",qt="Subscription: a CashToken contract for recurring automatic payments.",Vt="Subscription",Mt={covenant:{description:`Hold asset in escrow for a subscription. 

Regular installments will be made automatically at regular intervals. The balance can be administered with authorizing NFT baton.`,name:"Subscription Vault",scripts:["lock","execute","administer"],variables:{auth:{description:"CashToken Category of the NFT series administering the subscription.",name:"Authentication Token Category",type:"WalletData"},period:{description:"The time period between installment payments.",name:"Period",type:"WalletData"},recipient:{description:"The entity the subscription will pay.",name:"Recipient",type:"WalletData"},installment:{description:"The installment value, denominated in CashTokens.",name:"Installment",type:"WalletData"}}},wallet:{description:"Standard p2pkh wallet controlling the exchange minting NFT baton",name:"Exchange Owner",scripts:["wallet_unlock","wallet_lock"],variables:{key:{description:"The private key that controls this wallet.",name:"Key",type:"HdKey"}}}},Xt={base:{data:{bytecode:{installment:"1000",auth:"0xefbe00000000000000000000000000000000000000000000000000000000adde",period:"144",recipient:"0xa914e78564d75c446f8c00c757a2bd783d30c4f0819a87"}},description:"",name:"Base Scenario"},release:{data:{bytecode:{locktime:"144",recipient:"0xa914e78564d75c446f8c00c757a2bd783d30c4f0819a87",installment:"1000",auth:"0xefbe00000000000000000000000000000000000000000000000000000000adde"}},description:"",extends:"base",name:"Release Assets",transaction:{inputs:[{unlockingBytecode:["slot"],sequenceNumber:144}],outputs:[{lockingBytecode:"a914e78564d75c446f8c00c757a2bd783d30c4f0819a87",valueSatoshis:800,token:{amount:"1000",category:"242f6ecedb404c743477e35b09733a56cacae34f3109d5cee1cbc1d5630affd7"}},{lockingBytecode:{script:"lock"},valueSatoshis:5e3,token:{amount:"99000",category:"242f6ecedb404c743477e35b09733a56cacae34f3109d5cee1cbc1d5630affd7"}}],locktime:11,version:2},sourceOutputs:[{lockingBytecode:["slot"],valueSatoshis:1e4,token:{amount:"100000",category:"242f6ecedb404c743477e35b09733a56cacae34f3109d5cee1cbc1d5630affd7"}}]},withdraw:{data:{bytecode:{locktime:"144",recipient:"0xa914e78564d75c446f8c00c757a2bd783d30c4f0819a87",installment:"1000",auth:"0xefbe00000000000000000000000000000000000000000000000000000000adde"}},description:"",extends:"base",name:"Cancel Subscription",transaction:{inputs:[{unlockingBytecode:{script:"wallet_unlock"},sequenceNumber:144},{unlockingBytecode:["slot"],sequenceNumber:144}],outputs:[{valueSatoshis:800,token:{category:"dead00000000000000000000000000000000000000000000000000000000beef",nft:{capability:"minting"}}},{lockingBytecode:{script:"lock"},valueSatoshis:1e4,token:{amount:"99000",category:"242f6ecedb404c743477e35b09733a56cacae34f3109d5cee1cbc1d5630affd7"}}],locktime:11,version:2},sourceOutputs:[{lockingBytecode:{script:"wallet_lock"},valueSatoshis:800,token:{category:"dead00000000000000000000000000000000000000000000000000000000beef",nft:{capability:"minting"}}},{lockingBytecode:["slot"],valueSatoshis:10800,token:{amount:"100000",category:"242f6ecedb404c743477e35b09733a56cacae34f3109d5cee1cbc1d5630affd7"}}]}},Wt={execute:{passes:["release"],name:"Process Installment",script:"",unlocks:"lock"},administer:{passes:["withdraw"],name:"Administer",script:"",unlocks:"lock"},wallet_unlock:{name:"Unlock",script:`<key.schnorr_signature.all_outputs>
<key.public_key>`,unlocks:"wallet_lock"},wallet_lock:{lockingType:"standard",name:"P2PKH Lock",script:`OP_DUP
OP_HASH160 <$(<key.public_key> OP_HASH160
)> OP_EQUALVERIFY
OP_CHECKSIG`},lock:{lockingType:"standard",name:"Subscription Covenant",script:` <installment> <recipient> <period> <auth> 
    
// Unspent Phi
//
// Subscription v3 
//
// Subscription: Schedule regular token payments
//
// A contract for anyone-can-spend MEV-powered token payments, managed by NFT baton.
// 
// - Vestment of shares at regular intervals.
// - Monthly or weekly "stable" coin denominated subscriptions.
// - Revocable bitcoin annuities via wrapped bitcoin tokens.
//
// The commitment for NFT serialization is:
//
// <"U3S"><\${installment}><0x\${recipient}><\${period}>
// 
// ...

// contract Subscription(

  
// Category of the authenticating baton
  // The auth baton is managed by the wallet of the user, 
  // The contract is agnostic of the token paid to the receipt.
  // bytes32 authCat,

  // payment interval (blocks)
  // int period,

  // LockingBytecode of the beneficiary, the address receiving payments
  // bytes recipientLockingBytecode,

  // Amount of tokens being vested each period 
  // int installment,
    
// ) {
  // 
  // function execute() {

    OP_0 OP_UTXOTOKENCATEGORY OP_SWAP OP_2 OP_CAT OP_EQUAL OP_IF 
    // if(tx.inputs[0].tokenCategory == authCat + 0x02){
         // threads are unencumbered if the minting baton is in the first input
    // }
    OP_ELSE 
    // else{

      // Require version 2 for BIP68 support 
      // OP_TXVERSION OP_2 OP_NUMEQUALVERIFY 
      // require(tx.version == 2);
      
      // Require a rolling timelock is satisfied
      // OP_DUP OP_CHECKSEQUENCEVERIFY OP_DROP
      // require(tx.age >= period);

      // Require payment in the same token
      // OP_INPUTINDEX OP_OUTPUTTOKENCATEGORY OP_INPUTINDEX OP_UTXOTOKENCATEGORY OP_EQUALVERIFY 
      // require(tx.outputs[this.activeInputIndex].tokenCategory == tx.inputs[this.activeInputIndex].tokenCategory);

      // Require that each output sends to the intended recipient
      // OP_INPUTINDEX OP_OUTPUTBYTECODE OP_2 OP_PICK OP_EQUALVERIFY 
      // require(tx.outputs[this.activeInputIndex].lockingBytecode == recipientLockingBytecode);

      // Require minimum token dust  
      // OP_INPUTINDEX OP_OUTPUTVALUE <800> OP_NUMEQUALVERIFY 
      // require(tx.outputs[this.activeInputIndex].value == 800);

      // If not enough tokens remain to fulfill an installment,
      OP_INPUTINDEX OP_UTXOTOKENAMOUNT OP_3 OP_PICK OP_LESSTHANOREQUAL OP_IF 
      // if(tx.inputs[this.activeInputIndex].tokenAmount <= installment){

          // require token liquidation
          // OP_INPUTINDEX OP_OUTPUTTOKENAMOUNT OP_INPUTINDEX OP_UTXOTOKENAMOUNT OP_NUMEQUALVERIFY 
          // require(tx.outputs[this.activeInputIndex].tokenAmount == tx.inputs[this.activeInputIndex].tokenAmount);

      // } 
      OP_ELSE
      // else{
          // Require that installment paid
          // OP_INPUTINDEX OP_OUTPUTTOKENAMOUNT OP_3 OP_PICK OP_NUMEQUALVERIFY 
          // require(tx.outputs[this.activeInputIndex].tokenAmount == installment);

          // Push the index of the output
          OP_INPUTINDEX OP_TXINPUTCOUNT OP_ADD 
          // int outIndex = this.activeInputIndex + tx.inputs.length;

          // Require the executor fee is not excessive 
          // OP_DUP OP_OUTPUTVALUE OP_INPUTINDEX OP_UTXOVALUE <5000> OP_SUB OP_NUMEQUALVERIFY
          // require(tx.outputs[outIndex].value == tx.inputs[this.activeInputIndex].value - 5000);
              
          // Require that the token remainder after installment is returned
          // OP_DUP OP_OUTPUTTOKENAMOUNT OP_INPUTINDEX OP_UTXOTOKENAMOUNT OP_5 OP_PICK OP_SUB OP_NUMEQUALVERIFY 
          // require(tx.outputs[outIndex].tokenAmount == tx.inputs[this.activeInputIndex].tokenAmount - installment);

          // Require the token category is identical
          // OP_DUP OP_OUTPUTTOKENCATEGORY OP_INPUTINDEX OP_UTXOTOKENCATEGORY OP_EQUALVERIFY 
          // require(tx.outputs[outIndex].tokenCategory == tx.inputs[this.activeInputIndex].tokenCategory);

          // Require the second output match the active bytecode
          // OP_DUP OP_OUTPUTBYTECODE OP_INPUTINDEX OP_UTXOBYTECODE OP_EQUALVERIFY 
          // require(tx.outputs[outIndex].lockingBytecode == tx.inputs[this.activeInputIndex].lockingBytecode);
      // } 
      OP_DROP

    // } 
    OP_ENDIF

  // } 
  OP_ENDIF OP_2DROP OP_DROP OP_1

// }
//`}},Yt=["BCH_2026_05","BCH_SPEC"],Ht={$schema:Ft,description:qt,name:Vt,entities:Mt,scenarios:Xt,scripts:Wt,supported:Yt},Kt="@unspent/subscription",$t={name:Kt};class A{static USER_AGENT=$t.name;static PROTOCOL_IDENTIFIER="U3S";static EXECUTOR_FEE=5e3;static tokenAware=!0;static template=Ht;static compiler=bt(this.template);static vm=Rt();static dataToBytecode(e){return{installment:K(e.installment),recipient:e.recipient,period:K(BigInt(e.period)),auth:new Uint8Array(e.auth).reverse()}}static parseNFT(e){if(e.token_data?.nft?.commitment){let t=Nt(P(e.token_data?.nft?.commitment));if(yt(t[0])!==this.PROTOCOL_IDENTIFIER)throw Error("Non-subscription record NFT passed as subscription");return{installment:t[1],recipient:t[2],period:t[3],auth:P(e.token_data.category)}}else throw Error("Could not parse subscription NFT")}static encodeCommitment(e){let t=Tt(`<"${this.PROTOCOL_IDENTIFIER}"><${e.installment}><0x${w(e.recipient)}><${e.period}>`);if(typeof t=="string")throw t;return w(t)}static getLockingBytecode(e){const t=this.compiler.generateBytecode({data:{bytecode:e},scriptId:"lock"});if(!t.success)throw new Error("Failed to generate bytecode, script: , "+JSON.stringify(t,null,"  "));return t.bytecode}static getUnlockingBytecode(e){const t=this.compiler.generateBytecode({data:{bytecode:e},scriptId:"execute"});if(!t.success)throw new Error("Failed to generate bytecode, script: , "+JSON.stringify(t,null,"  "));return t.bytecode}static getScriptHash(e,t=!0){let i=this.dataToBytecode(e);return Z(this.getLockingBytecode(i),t)}static getAddress(){throw Error("No Cashaddr for p2s contract type")}static getSourceOutput(e,t){return{lockingBytecode:this.getLockingBytecode(e),valueSatoshis:BigInt(t.value),token:t.token_data?{category:P(t.token_data.category),amount:BigInt(t.token_data.amount)}:void 0}}static getInput(e,t,i){return{outpointIndex:t.tx_pos,outpointTransactionHash:P(t.tx_hash),sequenceNumber:i,unlockingBytecode:{data:{bytecode:e},compiler:this.compiler,script:"execute",valueSatoshis:BigInt(t.value),token:t.token_data?{category:P(t.token_data.category),amount:BigInt(t.token_data.amount)}:void 0}}}static getInstallmentOutput(e,t){let i=N(e.installment);if(typeof i=="string")throw i;return BigInt(t.token_data?.amount)<i&&(i=BigInt(t.token_data?.amount)),{lockingBytecode:e.recipient,valueSatoshis:800n,token:t.token_data?{category:P(t.token_data.category),amount:i}:void 0}}static getReturnOutput(e,t){let i=N(e.installment);if(typeof i=="string")throw i;return{lockingBytecode:{data:{bytecode:e},compiler:this.compiler,script:"lock"},valueSatoshis:BigInt(t.value-this.EXECUTOR_FEE),token:t.token_data?{category:P(t.token_data.category),amount:BigInt(t.token_data.amount)-i}:void 0}}static getExecutorOutput(e,t){let i=tt(e);if(typeof i=="string")throw i;return{lockingBytecode:i.bytecode,valueSatoshis:BigInt(t)}}static getWalletInputs(e,t,i,l,u=[]){let _=[],h=[];if(l&&typeof l!="string"&&(l=w(l)),l?e=e.filter(a=>a.token_data&&a.token_data?.category==l).filter(a=>a.token_data&&!a.token_data.nft):e=e.filter(a=>!a.token_data),e.length==0)throw Error("no wallet utxos left, maximum recursion depth reached.");const c=Math.floor(Math.random()*e.length),m=e[c];e.splice(c,1),_.push(Pt(m,i)),u.push(It(m,i));let r=U(u),p=v(u,l);if(l&&p<t||!l&&r<t){let a=this.getWalletInputs([...e],t,i,l,[...u]);_.push(...a.inputs),h.push(...a.outputs),u=a.sourceOutputs}return{inputs:_,outputs:h,sourceOutputs:u}}static getWalletLayers(e,t,i,l,u){let _=$(t.outputs),h=U(i),c=_-h;const m=this.getWalletInputs(l,c,u);t.inputs.push(...m.inputs),i.push(...m.sourceOutputs);let r=Q(t.outputs,e),p=v(i,e),a=r-p;if(a>0n){const f=this.getWalletInputs(l,a,u,e);t.inputs.push(...f.inputs),i.push(...f.sourceOutputs)}_=$(t.outputs),h=U(i);let n=h-_;r=Q(t.outputs,e),p=v(i,e);let s=p-r;return s>0&&(t.outputs.push(z(800n,s,e,u)),n-=800n),t.outputs.push(z(n,0n,void 0,u)),t}static execute(e,t,i,l=1){const u=[],_=[];let h=[],c={locktime:0,version:2,inputs:u,outputs:_};for(let n of e){let s=this.parseNFT(n.record);if(n.utxo.height>0&&n.utxo.value>5800){const f=t-n.utxo.height,k=q(s.period),g=N(s.installment);if(typeof g=="string")throw g;f>=k&&BigInt(n.utxo.token_data?.amount)>=g&&(c.inputs.push(this.getInput(s,n.utxo,f)),c.outputs.push(this.getInstallmentOutput(s,n.utxo)),h.push(this.getSourceOutput(s,n.utxo)))}}for(let n of e){let s=this.parseNFT(n.record);if(n.utxo.height>0&&n.utxo.value>5800){const f=t-n.utxo.height,k=q(s.period),g=N(s.installment);if(typeof g=="string")throw g;f>=k&&BigInt(n.utxo.token_data?.amount)>=g&&c.outputs.push(this.getReturnOutput(s,n.utxo))}}for(let n of e){let s=this.parseNFT(n.record);if(n.utxo.height>0&&n.utxo.value>5800){const f=t-n.utxo.height,k=q(s.period),g=N(s.installment);if(typeof g=="string")throw g;f>=k&&BigInt(n.utxo.token_data?.amount)<g&&(c.inputs.push(this.getInput(s,n.utxo,f)),c.outputs.push(this.getInstallmentOutput(s,n.utxo)),h.push(this.getSourceOutput(s,n.utxo)))}}i&&c.inputs.length>0&&c.outputs.push(this.getExecutorOutput(i,c.inputs.length*(this.EXECUTOR_FEE-800)));let m=B(c);if(!m.success)throw new Error("generate transaction failed!, errors: "+JSON.stringify(m.errors,null,"  "));if(i&&c.inputs.length>0){const n=G(m.transaction,l)+1n,s=c.outputs.length-1;c.outputs[s].valueSatoshis=c.outputs[s].valueSatoshis-n}if(m=B(c),!m.success)throw new Error("generate transaction failed!, errors: "+JSON.stringify(m.errors,null,"  "));const r=m.transaction,p=j(r,h,{maximumTokenCommitmentLength:40});if(p!==!0)throw p;let a=this.vm.verify({sourceOutputs:h,transaction:r});if(typeof a=="string")throw a;return{sourceOutputs:h,transaction:r,verify:a}}static administer(e,t,i,l,u,_=0,h=1){let r={locktime:0,version:2,inputs:[],outputs:[]};e.token_data.category;const p=Et(e,u,_);r.inputs.push(...p.inputs),r.outputs.push(...p.outputs);let a=p.sourceOutputs;r=this.getWalletLayers(t,r,a,l,u);let n=B(r);if(!n.success)throw new Error("generate transaction failed!, errors: "+JSON.stringify(n.errors,null,"  "));const s=G(n.transaction,h),f=r.outputs.length-1;if(r.outputs[f].valueSatoshis=r.outputs[f].valueSatoshis-s,n=B(r),!n.success)throw new Error("generate transaction failed!, errors: "+JSON.stringify(n.errors,null,"  "));const k=n.transaction,g=j(k,a,{maximumTokenCommitmentLength:40});if(g!==!0&&h>0)throw g;let T=this.vm.verify({sourceOutputs:a,transaction:k});if(typeof T=="string")throw Error(T);let S=U(a)-U(k.outputs);S>s+10n&&(T=`Excessive fees: ${S} for ${s} byte tx`),v(a,t)==0n&&(T="Error checking token input");let x=v(a,t)-v(k.outputs,t);return x!==0n&&(T=`Swapping should not create destroy tokens, token difference: ${x}`),{sourceOutputs:a,transaction:k,verify:T}}}var Qt=C("<img/>"),zt=C('<img alt="Disconnected"/>'),Gt=C('<section><div class="status svelte-1jejjaq"><!> <!></div> <!></section>');function he(I,e){ut(e,!0);const t=dt.url.hostname=="vox.cash";t?w(ht):w(mt);const i=t?"bch.imaginary.cash":"chipnet.bch.ninja";let l=y(0),u=y(""),_=y(""),h=y(0),c=new Set,m=0,r,p=y(M([])),a=y(M([])),n=y(""),s=y(void 0),f="",k=y("");const g=async function(o){if(o.method==="blockchain.headers.subscribe"){let O=o.params[0];b(l,O.height,!0)}else o.method==="blockchain.scripthash.subscribe"?o.params[1]!==d(_)&&(b(_,o.params[1],!0),b(u,Ut[d(s).status],!0),T()):console.log(o)},T=()=>{clearTimeout(m),m=setTimeout(()=>{S(),x()},1500)},S=async function(){let o=await d(s).request("blockchain.scripthash.listunspent",d(k),"include_tokens");if(o instanceof Error)throw o;b(a,o,!0),b(h,vt(d(a),!0),!0),b(a,d(a).filter(O=>!O.token_data).filter(O=>O.height>0),!0)},x=async function(){let o=await d(s).request("blockchain.scripthash.listunspent",f,"include_tokens");if(o instanceof Error)throw o;let O=new Set(o.map(E=>`${E.tx_hash}":"${E.tx_pos}`));(d(p).length==0||c.intersection(O).size==0)&&b(p,o,!0),b(p,d(p).filter(E=>E.height>0),!0),d(p).sort((E,at)=>E.height-at.height)};ot(async()=>{St.StorageProvider=wt,r=t?await xt.named("vox"):await Bt.named("vox"),b(n,At(r.mnemonic,r.derivationPath.slice(0,-2),r.isTestnet),!0);let o=tt(r.getDepositAddress());if(typeof o=="string")throw o;b(k,Z(o.bytecode),!0);let O={installment:100n,period:0,recipient:o.bytecode,auth:Uint8Array.from([])};A.getAddress(O),b(s,new J(A.USER_AGENT,"1.4.1",i),!0),await d(s).connect(),d(s).on("notification",g),await d(s).subscribe("blockchain.scripthash.subscribe",f),await d(s).subscribe("blockchain.scripthash.subscribe",d(k)),await d(s).subscribe("blockchain.headers.subscribe")}),rt(async()=>{await new J(A.USER_AGENT,"1.4.1",i).disconnect()});var D=Gt(),L=X(D),V=X(L);ft(V,{get template(){return A.template}});var et=W(V,2);{var nt=o=>{var O=Qt();H(()=>{F(O,"src",gt),F(O,"alt",d(u))}),R(o,O)},it=o=>{var O=zt();H(()=>F(O,"src",Ot)),R(o,O)};pt(et,o=>{d(u)=="CONNECTED"?o(nt):o(it,!1)})}Y(L);var st=W(L,2);Lt(st),Y(D),R(I,D),lt()}export{he as component,de as universal};
//# sourceMappingURL=14.DkbmnIcR.js.map
