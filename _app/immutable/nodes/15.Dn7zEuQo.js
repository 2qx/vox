import{f as R,a as A}from"../chunks/BQ8W2y5r.js";import{o as it,a as st}from"../chunks/Bd70tTqc.js";import{aI as ot,p as rt,a_ as _,as as q,a as ct,c as V,s as X,ap as y,w as g,r as M,t as W}from"../chunks/5yJvB4cG.js";import{i as ut}from"../chunks/C92i--r8.js";import{a as L}from"../chunks/DXPSGXEJ.js";import{p as lt}from"../chunks/CP6jRk6V.js";import"../chunks/Bx2aHIrS.js";import{B as pt,t as dt}from"../chunks/COsE9KFn.js";import{B as ht}from"../chunks/DiEBMA-_.js";import{C as mt}from"../chunks/B7hCbxZp.js";import{D as gt}from"../chunks/DMvn4Q5j.js";import{c as ft,M as Ot,i as kt,n as Y,N as yt,d as _t,h as P,t as Tt,b as C,k as j,w as J,O as bt,P as Pt,s as N,r as U,Q as H,R as K,S as Q,m as x,q as $,v as z,T as It,z as Et,A as vt}from"../chunks/D6NMCXg_.js";import{d as Ut}from"../chunks/NPSzfOGJ.js";import{e as G,C as Nt}from"../chunks/hh7Yrpmc.js";import{I as St,B as wt,W as xt,T as Bt}from"../chunks/C1k_McN5.js";const At=(I=!0)=>ft(Ot(I)),Ct=!0,pe=Object.freeze(Object.defineProperty({__proto__:null,prerender:Ct},Symbol.toStringTag,{value:"Module"}));var Rt=R('<h3>About Subscriptions</h3> <p>Setup subscriptions paying in CashTokens for regular payments to a pre-defined address.</p> <p>Subscribers can cancel at any time and withdraw the balance of the pre-paid fund using an NFT “key card”.</p> <p>More about the <a href="https://bitcoincashresearch.org/t/unspent-phi-v3-timelocking-token-aware-contracts/1501#subscriptions-share-vesting-revocable-token-annuities-3" rel="nofollow">contract here</a></p> <h3>See Also:</h3> <p><a href="https://github.com/KarolTrzeszczkowski/Mecenas-recurring-payment-EC-plugin" rel="nofollow">Mecenas</a> by Karol Trzeszczkowski (Licho#14431)</p>',1);function Dt(I){var e=Rt();ot(10),A(I,e)}const Lt="https://libauth.org/schemas/wallet-template-v0.schema.json",Ft="Subscription: a CashToken contract for recurring automatic payments.",qt="Subscription",Vt={covenant:{description:`Hold asset in escrow for a subscription. 

Regular installments will be made automatically at regular intervals. The balance can be administered with authorizing NFT baton.`,name:"Subscription Vault",scripts:["lock","execute","administer"],variables:{auth:{description:"CashToken Category of the NFT series administering the subscription.",name:"Authentication Token Category",type:"WalletData"},period:{description:"The time period between installment payments.",name:"Period",type:"WalletData"},recipient:{description:"The entity the subscription will pay.",name:"Recipient",type:"WalletData"},installment:{description:"The installment value, denominated in CashTokens.",name:"Installment",type:"WalletData"}}},wallet:{description:"Standard p2pkh wallet controlling the exchange minting NFT baton",name:"Exchange Owner",scripts:["wallet_unlock","wallet_lock"],variables:{key:{description:"The private key that controls this wallet.",name:"Key",type:"HdKey"}}}},Xt={base:{data:{bytecode:{installment:"1000",auth:"0xefbe00000000000000000000000000000000000000000000000000000000adde",period:"144",recipient:"0xa914e78564d75c446f8c00c757a2bd783d30c4f0819a87"}},description:"",name:"Base Scenario"},release:{data:{bytecode:{locktime:"144",recipient:"0xa914e78564d75c446f8c00c757a2bd783d30c4f0819a87",installment:"1000",auth:"0xefbe00000000000000000000000000000000000000000000000000000000adde"}},description:"",extends:"base",name:"Release Assets",transaction:{inputs:[{unlockingBytecode:["slot"],sequenceNumber:144}],outputs:[{lockingBytecode:"a914e78564d75c446f8c00c757a2bd783d30c4f0819a87",valueSatoshis:1e3,token:{amount:"1000",category:"242f6ecedb404c743477e35b09733a56cacae34f3109d5cee1cbc1d5630affd7"}},{lockingBytecode:{script:"lock"},valueSatoshis:5e3,token:{amount:"99000",category:"242f6ecedb404c743477e35b09733a56cacae34f3109d5cee1cbc1d5630affd7"}}],locktime:11,version:2},sourceOutputs:[{lockingBytecode:["slot"],valueSatoshis:1e4,token:{amount:"100000",category:"242f6ecedb404c743477e35b09733a56cacae34f3109d5cee1cbc1d5630affd7"}}]},withdraw:{data:{bytecode:{locktime:"144",recipient:"0xa914e78564d75c446f8c00c757a2bd783d30c4f0819a87",installment:"1000",auth:"0xefbe00000000000000000000000000000000000000000000000000000000adde"}},description:"",extends:"base",name:"Cancel Subscription",transaction:{inputs:[{unlockingBytecode:{script:"wallet_unlock"},sequenceNumber:144},{unlockingBytecode:["slot"],sequenceNumber:144}],outputs:[{valueSatoshis:1e3,token:{category:"dead00000000000000000000000000000000000000000000000000000000beef",nft:{capability:"minting"}}},{lockingBytecode:{script:"lock"},valueSatoshis:1e4,token:{amount:"99000",category:"242f6ecedb404c743477e35b09733a56cacae34f3109d5cee1cbc1d5630affd7"}}],locktime:11,version:2},sourceOutputs:[{lockingBytecode:{script:"wallet_lock"},valueSatoshis:1e3,token:{category:"dead00000000000000000000000000000000000000000000000000000000beef",nft:{capability:"minting"}}},{lockingBytecode:["slot"],valueSatoshis:11e3,token:{amount:"100000",category:"242f6ecedb404c743477e35b09733a56cacae34f3109d5cee1cbc1d5630affd7"}}]}},Mt={execute:{passes:["release"],name:"Process Installment",script:"",unlocks:"lock"},administer:{passes:["withdraw"],name:"Administer",script:"",unlocks:"lock"},wallet_unlock:{name:"Unlock",script:`<key.schnorr_signature.all_outputs>
<key.public_key>`,unlocks:"wallet_lock"},wallet_lock:{lockingType:"standard",name:"P2PKH Lock",script:`OP_DUP
OP_HASH160 <$(<key.public_key> OP_HASH160
)> OP_EQUALVERIFY
OP_CHECKSIG`},lock:{lockingType:"standard",name:"Subscription Covenant",script:` <"U3S"> <installment> <recipient> <period> <auth> 
    
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
      // OP_INPUTINDEX OP_OUTPUTVALUE <1000> OP_NUMEQUALVERIFY 
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
  OP_ENDIF OP_2DROP OP_DROP OP_DROP OP_1

// }
//`}},Wt=["BCH_2026_05","BCH_SPEC"],Yt={$schema:Lt,description:Ft,name:qt,entities:Vt,scenarios:Xt,scripts:Mt,supported:Wt},Ht="@unspent/subscription",Kt={name:Ht};class B{static USER_AGENT=Kt.name;static PROTOCOL_IDENTIFIER="U3S";static EXECUTOR_FEE=5e3;static tokenAware=!0;static template=Yt;static compiler=kt(this.template);static vm=At();static dataToBytecode(e){return{installment:Y(e.installment),recipient:e.recipient,period:Y(BigInt(e.period)),auth:new Uint8Array(e.auth).reverse()}}static bytecodeToData(e){const t=yt(e.installment);if(typeof t!="bigint")throw t;return{installment:t,recipient:e.recipient,period:_t(e.period),auth:new Uint8Array(e.auth).reverse()}}static parseCommitment(e){typeof e=="string"&&(e=P(e));const t=Ut(e);if(Tt(t[0])!==this.PROTOCOL_IDENTIFIER)throw Error(`"Non-${typeof this} record NFT passed as ${typeof this}"`);return{installment:t[1],recipient:t[2],period:t[3],auth:t[4]}}static encodeCommitment(e){const t=this.dataToBytecode(e);return C(this.getLockingBytecode(t))}static getLockingBytecode(e){const t=this.compiler.generateBytecode({data:{bytecode:e},scriptId:"lock"});if(!t.success)throw new Error("Failed to generate bytecode, script: , "+JSON.stringify(t,null,"  "));return t.bytecode}static getScriptHash(e,t=!0){let n=this.dataToBytecode(e);return j(this.getLockingBytecode(n),t)}static getAddress(){throw Error("No Cashaddr for p2s contract type")}static getSourceOutput(e,t){let n=this.dataToBytecode(e);return{lockingBytecode:this.getLockingBytecode(n),valueSatoshis:BigInt(t.value),token:t.token_data?{category:P(t.token_data.category),amount:BigInt(t.token_data.amount)}:void 0}}static getInput(e,t,n){let c=this.dataToBytecode(e);return{outpointIndex:t.tx_pos,outpointTransactionHash:P(t.tx_hash),sequenceNumber:n,unlockingBytecode:{data:{bytecode:c},compiler:this.compiler,script:"execute",valueSatoshis:BigInt(t.value),token:t.token_data?{category:P(t.token_data.category),amount:BigInt(t.token_data.amount)}:void 0}}}static subscriptionToOutput(e){let t=this.dataToBytecode(e.data),n=this.getLockingBytecode(t),c=typeof e.category=="string"?P(e.category):e.category,u=BigInt(e.installmentCount*this.EXECUTOR_FEE),d=BigInt(e.installmentCount)*e.data.installment;return{lockingBytecode:n,valueSatoshis:u,token:{category:c,amount:d}}}static getInstallmentOutput(e,t){let n=e.installment;return BigInt(t.token_data?.amount)<n&&(n=BigInt(t.token_data?.amount)),{lockingBytecode:e.recipient,valueSatoshis:1000n,token:t.token_data?{category:P(t.token_data.category),amount:n}:void 0}}static getReturnOutput(e,t){return{lockingBytecode:{data:{bytecode:this.dataToBytecode(e)},compiler:this.compiler,script:"lock"},valueSatoshis:BigInt(t.value-this.EXECUTOR_FEE),token:t.token_data?{category:P(t.token_data.category),amount:BigInt(t.token_data.amount)-e.installment}:void 0}}static getExecutorOutput(e,t){let n=J(e);if(typeof n=="string")throw n;return{lockingBytecode:n.bytecode,valueSatoshis:BigInt(t)}}static getWalletInputs(e,t,n,c,u=[]){let d=[],h=[];if(c&&typeof c!="string"&&(c=C(c)),c?e=e.filter(i=>i.token_data&&i.token_data?.category==c).filter(i=>i.token_data&&!i.token_data.nft):e=e.filter(i=>!i.token_data),e.length==0)throw Error("no wallet utxos left, maximum recursion depth reached.");const l=Math.floor(Math.random()*e.length),f=e[l];e.splice(l,1),d.push(bt(f,n)),u.push(Pt(f,n));let r=N(u),m=U(u,c);if(c&&m<t||!c&&r<t){let i=this.getWalletInputs([...e],t,n,c,[...u]);d.push(...i.inputs),h.push(...i.outputs),u=i.sourceOutputs}return{inputs:d,outputs:h,sourceOutputs:u}}static getWalletLayers(e,t,n,c,u){let d=H(t.outputs),h=N(n),l=d-h;const f=this.getWalletInputs(c,l,u);t.inputs.push(...f.inputs),n.push(...f.sourceOutputs);let r=K(t.outputs,e),m=U(n,e),i=r-m;if(i>0n){const O=this.getWalletInputs(c,i,u,e);t.inputs.push(...O.inputs),n.push(...O.sourceOutputs)}d=H(t.outputs),h=N(n);let a=h-d;r=K(t.outputs,e),m=U(n,e);let s=m-r;return s>0&&(t.outputs.push(Q(1000n,s,e,u)),a-=1000n),t.outputs.push(Q(a,0n,void 0,u)),t}static setThreadLayers(e,t=[]){let n=[],c=[];if(new Set(e.map(d=>d.data)).size>1)throw"Cannot mix covenant types";return c.push(...e.map(d=>this.subscriptionToOutput(d))),{inputs:n,outputs:c,sourceOutputs:t}}static execute(e,t,n,c=1){const u=[],d=[];let h=[],l={locktime:0,version:2,inputs:u,outputs:d};for(let a of e){let s=this.parseCommitment(a.record);if(a.utxo.height>0&&a.utxo.value>5800){const O=t-a.utxo.height,p=this.bytecodeToData(s);O>=p.period&&BigInt(a.utxo.token_data?.amount)>=p.installment&&(l.inputs.push(this.getInput(p,a.utxo,O)),l.outputs.push(this.getInstallmentOutput(p,a.utxo)),h.push(this.getSourceOutput(p,a.utxo)))}}for(let a of e){let s=this.parseCommitment(a.record);if(a.utxo.height>0&&a.utxo.value>5800){const O=t-a.utxo.height,p=this.bytecodeToData(s);O>=p.period&&BigInt(a.utxo.token_data?.amount)>=p.installment&&l.outputs.push(this.getReturnOutput(p,a.utxo))}}for(let a of e){let s=this.parseCommitment(a.record);if(a.utxo.height>0&&a.utxo.value>5800){const O=t-a.utxo.height,p=this.bytecodeToData(s);O>=p.period&&BigInt(a.utxo.token_data?.amount)<p.installment&&(l.inputs.push(this.getInput(p,a.utxo,O)),l.outputs.push(this.getInstallmentOutput(p,a.utxo)),h.push(this.getSourceOutput(p,a.utxo)))}}n&&l.inputs.length>0&&l.outputs.push(this.getExecutorOutput(n,l.inputs.length*(this.EXECUTOR_FEE-1e3)));let f=x(l);if(!f.success)throw new Error("generate transaction failed!, errors: "+JSON.stringify(f.errors,null,"  "));if(n&&l.inputs.length>0){const a=$(f.transaction,c)+1n,s=l.outputs.length-1;l.outputs[s].valueSatoshis=l.outputs[s].valueSatoshis-a}if(f=x(l),!f.success)throw new Error("generate transaction failed!, errors: "+JSON.stringify(f.errors,null,"  "));const r=f.transaction,m=z(r,h,{maximumTokenCommitmentLength:40});if(m!==!0)throw m;let i=this.vm.verify({sourceOutputs:h,transaction:r});if(typeof i=="string")throw i;return{sourceOutputs:h,transaction:r,verify:i}}static administer(e,t,n,c,u,d=0,h=1){let r={locktime:0,version:2,inputs:[],outputs:[]};e.token_data.category;const m=It(e,u,d);r.inputs.push(...m.inputs),r.outputs.push(...m.outputs);let i=m.sourceOutputs;const a=this.setThreadLayers(n);r.inputs.push(...a.inputs),i.push(...a.sourceOutputs),r.outputs.push(...a.outputs),r=this.getWalletLayers(t,r,i,c,u);let s=x(r);if(!s.success)throw new Error("generate transaction failed!, errors: "+JSON.stringify(s.errors,null,"  "));const O=$(s.transaction,h),p=r.outputs.length-1;if(r.outputs[p].valueSatoshis=r.outputs[p].valueSatoshis-O,s=x(r),!s.success)throw new Error("generate transaction failed!, errors: "+JSON.stringify(s.errors,null,"  "));const b=s.transaction,S=z(b,i,{maximumTokenCommitmentLength:40});if(S!==!0&&h>0)throw S;let T=this.vm.verify({sourceOutputs:i,transaction:b});if(typeof T=="string")throw Error(T);let w=N(i)-N(b.outputs);w>O+10n&&(T=`Excessive fees: ${w} for ${O} byte tx`),U(i,t)==0n&&(T="Error checking token input");let E=U(i,t)-U(b.outputs,t);return E!==0n&&(T=`Swapping should not create destroy tokens, token difference: ${E}`),{sourceOutputs:i,transaction:b,verify:T}}}var Qt=R("<img/>"),$t=R('<img alt="Disconnected"/>'),zt=R('<section><div class="status svelte-13s96n2"><!> <!></div> <!></section>');function de(I,e){rt(e,!0);const t=lt.url.hostname=="vox.cash";t?C(pt):C(dt);const n=t?"bch.imaginary.cash":"chipnet.bch.ninja";let c=_(0),u=_(""),d=_(""),h=_(0),l=new Set,f=0,r,m=_(q([])),i=_(q([])),a=_(""),s=_(void 0),O="",p=_("");const b=async function(o){if(o.method==="blockchain.headers.subscribe"){let k=o.params[0];y(c,k.height,!0)}else o.method==="blockchain.scripthash.subscribe"?o.params[1]!==g(d)&&(y(d,o.params[1],!0),y(u,Nt[g(s).status],!0),S()):console.log(o)},S=()=>{clearTimeout(f),f=setTimeout(()=>{T(),w()},1500)},T=async function(){let o=await g(s).request("blockchain.scripthash.listunspent",g(p),"include_tokens");if(o instanceof Error)throw o;y(i,o,!0),y(h,vt(g(i),!0),!0),y(i,g(i).filter(k=>!k.token_data).filter(k=>k.height>0),!0)},w=async function(){let o=await g(s).request("blockchain.scripthash.listunspent",O,"include_tokens");if(o instanceof Error)throw o;let k=new Set(o.map(v=>`${v.tx_hash}":"${v.tx_pos}`));(g(m).length==0||l.intersection(k).size==0)&&y(m,o,!0),y(m,g(m).filter(v=>v.height>0),!0),g(m).sort((v,at)=>v.height-at.height)};it(async()=>{wt.StorageProvider=St,r=t?await xt.named("vox"):await Bt.named("vox"),y(a,Et(r.mnemonic,r.derivationPath.slice(0,-2),r.isTestnet),!0);let o=J(r.getDepositAddress());if(typeof o=="string")throw o;y(p,j(o.bytecode),!0);let k={installment:100n,period:0,recipient:o.bytecode,auth:Uint8Array.from([])};B.getAddress(k),y(s,new G(B.USER_AGENT,"1.4.1",n),!0),await g(s).connect(),g(s).on("notification",b),await g(s).subscribe("blockchain.scripthash.subscribe",O),await g(s).subscribe("blockchain.scripthash.subscribe",g(p)),await g(s).subscribe("blockchain.headers.subscribe")}),st(async()=>{await new G(B.USER_AGENT,"1.4.1",n).disconnect()});var E=zt(),D=V(E),F=V(D);ht(F,{get template(){return B.template}});var Z=X(F,2);{var tt=o=>{var k=Qt();W(()=>{L(k,"src",mt),L(k,"alt",g(u))}),A(o,k)},et=o=>{var k=$t();W(()=>L(k,"src",gt)),A(o,k)};ut(Z,o=>{g(u)=="CONNECTED"?o(tt):o(et,-1)})}M(D);var nt=X(D,2);Dt(nt),M(E),A(I,E),ct()}export{de as component,pe as universal};
//# sourceMappingURL=15.Dn7zEuQo.js.map
