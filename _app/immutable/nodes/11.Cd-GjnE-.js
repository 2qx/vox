import{_ as Ce}from"../chunks/Ct5FWWRu.js";import{f as D,a as w,c as Be,d as De}from"../chunks/Bu6ML9vF.js";import{o as Re,a as Me}from"../chunks/Cj7IOai5.js";import{o as Le,E as He,bv as Ve,b3 as Ke,m as re,u as st,bw as Fe,aA as qe,a0 as Xe,am as rt,aF as se,a_ as y,n as Ye,ap as f,w as e,aI as bt,p as ie,br as K,L as W,a8 as Xt,bs as je,c as b,r as v,s as _,f as ut,t as F,a as oe,ac as Ge,bx as $e,as as Yt,aG as We}from"../chunks/DBfwBvaO.js";import{a as Qe,s as U}from"../chunks/CNn2VpyY.js";import{i as Q}from"../chunks/CYslEwOP.js";import{h as ze}from"../chunks/DdDsCLaS.js";import{a as M,r as Je}from"../chunks/DKCD-EU9.js";import{d as Ze,a as Tt}from"../chunks/CNwA4967.js";import{a as ta}from"../chunks/Bgkbd40-.js";import"../chunks/Ch2B4nVl.js";import{h as N,g as ea,k as ce,l as aa,n as jt,a1 as na,a2 as ra,a3 as sa,a4 as ia,a5 as oa,a6 as ca,a7 as la,p as da,w as le,a8 as ua,Q as fa,s as ha,S as pa,m as vt,q as ma,v as _a,a9 as ga,aa as Oa,r as Gt,b as j,B as de,K as kt,L as Pa,J as Ta,z as $t,A as Wt,E as Qt,C as zt}from"../chunks/Cs0UEZa5.js";import{c as va}from"../chunks/ffiORl8I.js";import{e as ba,C as Jt}from"../chunks/hh7Yrpmc.js";import"../chunks/Dxr8WnRF.js";import{B as ka}from"../chunks/CdhaNLLI.js";import{C as ya}from"../chunks/B7hCbxZp.js";import{D as Ia}from"../chunks/DMvn4Q5j.js";import{e as Ea,i as Na}from"../chunks/IJZZyriy.js";import{l as ue,r as Ua,i as Zt}from"../chunks/BVcIytND.js";import{i as wa}from"../chunks/BzWO7PBX.js";import{p as Aa}from"../chunks/BSxBgH8s.js";import{L as Sa}from"../chunks/DhjoiuKW.js";import{I as xa,B as Ca,W as te}from"../chunks/D07MlZfM.js";import{B as Ba}from"../chunks/DHD6zs4M.js";function ee(o,t){se(()=>{o.dispatchEvent(new CustomEvent(t))})}function Da(o){if(o==="float")return"cssFloat";if(o==="offset")return"cssOffset";if(o.startsWith("--"))return o;const t=o.split("-");return t.length===1?t[0]:t[0]+t.slice(1).map(a=>a[0].toUpperCase()+a.slice(1)).join("")}function ae(o){const t={},a=o.split(";");for(const r of a){const[s,l]=r.split(":");if(!s||l===void 0)break;const d=Da(s.trim());t[d]=l.trim()}return t}const Ra=o=>o;function Ma(o,t,a,r){var s=(o&Fe)!==0,l="in",d,c=t.inert,g=t.style.overflow,O,u;function p(){return se(()=>d??=a()(t,r?.()??{},{direction:l}))}var m={is_global:s,in(){t.inert=c,O?.abort(),O=fe(t,p(),u,1,()=>{ee(t,"introstart")},()=>{ee(t,"introend"),O?.abort(),O=d=void 0,t.style.overflow=g})},out(T){{T?.(),d=void 0;return}},stop:()=>{O?.abort()}},P=Le;if((P.nodes.t??=[]).push(m),Qe){var I=s;if(!I){for(var h=P.parent;h&&(h.f&He)!==0;)for(;(h=h.parent)&&(h.f&Ve)===0;);I=!h||(h.f&Ke)!==0}I&&re(()=>{st(()=>m.in())})}}function fe(o,t,a,r,s,l){if(qe(t)){var d,c=!1;return Xe(()=>{if(!c){var T=t({direction:"in"});d=fe(o,T,a,r,s,l)}}),{abort:()=>{c=!0,d?.abort()},deactivate:()=>d.deactivate(),reset:()=>d.reset(),t:()=>d.t()}}if(!t?.duration&&!t?.delay)return s(),l(),{abort:rt,deactivate:rt,reset:rt,t:()=>r};const{delay:g=0,css:O,tick:u,easing:p=Ra}=t;var m=[];if(u&&u(0,1),O){var P=ae(O(0,1));m.push(P,P)}var I=()=>1-r,h=o.animate(m,{duration:g,fill:"forwards"});return h.onfinish=()=>{h.cancel(),s();var T=1-r,A=r-T,x=t.duration*Math.abs(A),S=[];if(x>0){var L=!1;if(O)for(var R=Math.ceil(x/16.666666666666668),C=0;C<=R;C+=1){var k=T+A*p(C/R),H=ae(O(k,1-k));S.push(H),L||=H.overflow==="hidden"}L&&(o.style.overflow="hidden"),I=()=>{var B=h.currentTime;return T+A*p(B/x)},u&&ue(()=>{if(h.playState!=="running")return!1;var B=I();return u(B,1-B),!0})}h=o.animate(S,{duration:x,fill:"forwards"}),h.onfinish=()=>{I=()=>r,u?.(r,1-r),l()}},{abort:()=>{h&&(h.cancel(),h.effect=null,h.onfinish=rt)},deactivate:()=>{l=rt},reset:()=>{},t:()=>I()}}function yt(o){return o}function It(o,t){if(o===t||o!==o)return()=>o;const a=typeof o;if(a!==typeof t||Array.isArray(o)!==Array.isArray(t))throw new Error("Cannot interpolate values of different type");if(Array.isArray(o)){const r=t.map((s,l)=>It(o[l],s));return s=>r.map(l=>l(s))}if(a==="object"){if(!o||!t)throw new Error("Object cannot be null");if(Zt(o)&&Zt(t)){const l=o.getTime(),c=t.getTime()-l;return g=>new Date(l+g*c)}const r=Object.keys(t),s={};return r.forEach(l=>{s[l]=It(o[l],t[l])}),l=>{const d={};return r.forEach(c=>{d[c]=s[c](l)}),d}}if(a==="number"){const r=t-o;return s=>o+s*r}return()=>t}class ft{#t;#a;#n;#e=null;constructor(t,a={}){this.#t=y(t),this.#a=y(t),this.#n=a}static of(t,a){const r=new ft(t(),a);return Ye(()=>{r.set(t())}),r}set(t,a){f(this.#a,t);let{delay:r=0,duration:s=400,easing:l=yt,interpolate:d=It}={...this.#n,...a};if(s===0)return this.#e?.abort(),f(this.#t,t),Promise.resolve();const c=Ua.now()+r;let g,O=!1,u=this.#e;return this.#e=ue(p=>{if(p<c)return!0;if(!O){O=!0;const P=this.#t.v;g=d(P,t),typeof s=="function"&&(s=s(P,t)),u?.abort(),u=null}const m=p-c;return m>s?(f(this.#t,t),!1):(f(this.#t,g(l(m/s))),!0)}),this.#e.promise}get current(){return e(this.#t)}get target(){return e(this.#a)}set target(t){this.set(t)}}const La=!0,Hn=Object.freeze(Object.defineProperty({__proto__:null,prerender:La},Symbol.toStringTag,{value:"Module"})),Ha="https://libauth.org/schemas/wallet-template-v0.schema.json",Va="Photons: A minable CashToken and decentralized energy oracle",Ka="Photons",Fa={covenant:{description:"Emit tokens if a transaction hash is low enough. Or, alternatively, allow anyone to use the vault thread as an oracle for a fee.",name:"Photon Vault",scripts:["lock","unlock"],variables:{age:{description:"The input age (as a number of blocks) claimed to withdraw tokens. The maximum age that can be used to claim tokens is the lessor of covenant thread age or user coins age being used to release tokens.",name:"Age",type:"WalletData"}}},miner:{description:"",name:"Mining Entity",scripts:["unlock","lock"],variables:{miner_key:{description:"The private key that controls this wallet.",name:"Key",type:"HdKey"}}},wallet:{description:"",name:"Funding Entity",scripts:["wallet_unlock","wallet_lock"],variables:{key:{description:"The private key that controls this wallet.",name:"Key",type:"HdKey"}}}},qa={release:{data:{bytecode:{age:"0"}},description:"",name:"Release Tokens",transaction:{inputs:[{outpointTransactionHash:"ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",outpointIndex:0,unlockingBytecode:["slot"],sequenceNumber:0}],outputs:[{lockingBytecode:{script:"lock"},valueSatoshis:1200,token:{amount:"2099995000000001",category:"deaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddead",nft:{capability:"mutable",commitment:"123456781f815ab0fb6d8064933edfa60e48ccccc2df9c2b055ba6182b0f3ee989811b7fdeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeadad"}}},{lockingBytecode:{script:"wallet_lock"},valueSatoshis:675,token:{amount:"4999999999",category:"deaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddead"}}],locktime:0,version:2},sourceOutputs:[{lockingBytecode:["slot"],valueSatoshis:2375,token:{amount:"2100000000000000",category:"deaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddead",nft:{capability:"mutable",commitment:"040000009863bfb8140e6a63bfb8140e6a63bfb8140e6a63bfb8140e6a63bfb8140effffdeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddead0000000012341234ffffffff"}}}]}},Xa={unlock:{passes:["release"],name:"Unlock Tokens",script:`<miner_key.public_key> <age> //
`,unlocks:"lock"},oracle:{name:"Use oracle",script:"",unlocks:"lock"},wallet_unlock:{name:"Wallet Unlock",script:"<key.schnorr_signature.all_outputs> <key.public_key>",unlocks:"wallet_lock"},lock:{lockingType:"p2sh32",name:"Photon Covenant",script:`  // pragma cashscript >= 0.10.0;

  // v2026072130

  // A token faucet with proof of work.
  // contract Photon() {

    // function emit(int age?, bytes minerPubKey?) {
        
        // Force a version two transaction
        OP_TXVERSION OP_2 OP_NUMEQUALVERIFY 
        // require(tx.version == 2);
        
        // Require the thread lives on
        OP_INPUTINDEX OP_OUTPUTBYTECODE 
        OP_INPUTINDEX OP_UTXOBYTECODE OP_EQUALVERIFY 
        // require(tx.outputs[this.activeInputIndex].lockingBytecode == tx.inputs[this.activeInputIndex].lockingBytecode);

        // Require the same token lives on
        OP_INPUTINDEX OP_OUTPUTTOKENCATEGORY 
        OP_INPUTINDEX OP_UTXOTOKENCATEGORY OP_EQUALVERIFY 
        // require(tx.outputs[this.activeInputIndex].tokenCategory == tx.inputs[this.activeInputIndex].tokenCategory);

        // If the baton is being used as an oracle ...
        OP_TXINPUTCOUNT OP_1 OP_GREATERTHAN OP_IF 
        // if(tx.inputs.length > 1){
           
            // Require the oracle user pays an 8000 sat fee 
            OP_INPUTINDEX OP_OUTPUTVALUE <8000> OP_ADD 
            OP_INPUTINDEX OP_UTXOVALUE OP_GREATERTHANOREQUAL OP_VERIFY 
            // require(tx.outputs[this.activeInputIndex].value + 8000 >= tx.inputs[this.activeInputIndex].value);

            // The NFT commitment (difficulty+nonce) must not change
            OP_INPUTINDEX OP_OUTPUTTOKENCOMMITMENT 
            OP_INPUTINDEX OP_UTXOTOKENCOMMITMENT OP_EQUALVERIFY 
            // require(tx.outputs[this.activeInputIndex].nftCommitment == tx.inputs[this.activeInputIndex].nftCommitment);

            // The number of fungible tokens must not changed
            OP_INPUTINDEX OP_OUTPUTTOKENAMOUNT 
            OP_INPUTINDEX OP_UTXOTOKENAMOUNT OP_NUMEQUALVERIFY 
            // require(tx.outputs[this.activeInputIndex].tokenAmount == tx.inputs[this.activeInputIndex].tokenAmount);

        // }

        // else (tx.inputs.length == 1)
        OP_ELSE 
        // else{

             // Check the purported time has passed and that time locks are enabled
            OP_DUP OP_CHECKSEQUENCEVERIFY OP_DROP 
            // require(this.age >= age);

            // require the age passed be block based
            OP_DUP <65535> OP_LESSTHAN OP_VERIFY
            // require(age < 65535);
            
            // require exactly two outputs
            OP_TXOUTPUTCOUNT OP_2 OP_NUMEQUALVERIFY 
            // require(tx.outputs.length == 2);

            // Allow miner to take 1200 token dust, plus 400 network fee allowance 
            OP_INPUTINDEX OP_OUTPUTVALUE 
            OP_INPUTINDEX OP_UTXOVALUE <1500> OP_SUB OP_GREATERTHANOREQUAL OP_VERIFY 
            // require(tx.outputs[this.activeInputIndex].value >= tx.inputs[this.activeInputIndex].value - 1500);

            // The value on the miner output is enforced by the network 
            // OP_1 OP_OUTPUTVALUE <800> OP_EQUALVERIFY
            // ~~require(tx.outputs[1].value == 800);~~

            // Emission schedule
            // Allow a fraction of running token balance (plus one) to be withdrawn.
            // Target a four year half life.
            OP_INPUTINDEX OP_OUTPUTTOKENAMOUNT 
            OP_INPUTINDEX OP_UTXOTOKENAMOUNT 
            OP_INPUTINDEX OP_UTXOTOKENAMOUNT <420000> OP_DIV OP_SUB 
            OP_GREATERTHANOREQUAL OP_VERIFY
            // require(
            //     tx.outputs[this.activeInputIndex].tokenAmount >= 
            //     (tx.inputs[this.activeInputIndex].tokenAmount - 
            //     (tx.inputs[this.activeInputIndex].tokenAmount/420000))
            // );
        
            // Commitment length must be 4+32+65
            OP_INPUTINDEX OP_OUTPUTTOKENCOMMITMENT OP_SIZE OP_NIP <100> OP_NUMEQUALVERIFY 
            
            //require(tx.outputs[this.activeInputIndex].nftCommitment.length == 100);

            // Require the output carries the next target.
            // The nonce and nonce length is unrestricted.
            OP_INPUTINDEX OP_OUTPUTTOKENCOMMITMENT <36> OP_SPLIT 
            // bytes message, bytes signature = tx.outputs[this.activeInputIndex].nftCommitment.split(36);

            // Get the next target
            OP_OVER OP_4 OP_SPLIT OP_NIP 
            // bytes nextTargetBytes = message.split(4)[1];

            // Check the nonce and target are signed
            OP_OVER OP_3 OP_PICK OP_6 OP_PICK OP_CHECKDATASIGVERIFY 
            
            // require(checkDataSig(datasig(signature), message, pk));
            
            // Require the output carries the next target.
            OP_DUP OP_BIN2NUM 
            // int nextTarget = int(nextTargetBytes);
                       
            // Pop the previous difficulty
            OP_INPUTINDEX OP_UTXOTOKENCOMMITMENT OP_4 OP_SPLIT OP_NIP <32> OP_SPLIT OP_DROP OP_BIN2NUM OP_ABS
            // int prevTarget = abs(int(tx.inputs[this.activeInputIndex].nftCommitment.split(4)[1].split(32)[0]));

            // The set the next target as a function of the previous target and age.
            // Target a once per block emission schedule
            // If the age is 0, lower the difficulty threshold ~0.7%
            // If the age is 1, keep the present difficulty
            // else, decrease difficulty in a linear manner  
            // Equality prevents setting next target to zero.
            // require(nextTarget == prevTarget * ((age + 143) /144));
            OP_2DUP OP_7  OP_PICK  <143> OP_ADD OP_MUL <144> OP_DIV OP_NUMEQUALVERIFY
          
            // Convert the token payout to a compact number
            OP_1 OP_OUTPUTTOKENAMOUNT OP_SIZE OP_NIP OP_4 OP_GREATERTHAN OP_IF 
            <0xff> OP_1 OP_OUTPUTTOKENAMOUNT OP_8 OP_NUM2BIN OP_CAT OP_NIP OP_ELSE 
            <0xfe> OP_1 OP_OUTPUTTOKENAMOUNT OP_4 OP_NUM2BIN OP_CAT OP_NIP OP_ENDIF
            // if(bytes(tx.outputs[1].tokenAmount).length > 8){
            //     rewardAmount = 0xff + bytes8(tx.outputs[1].tokenAmount);
            // } else{
            //     rewardAmount = 0xfe + bytes4(tx.outputs[1].tokenAmount);
            // }


            OP_TXVERSION OP_4 OP_NUM2BIN 
            OP_TXINPUTCOUNT OP_CAT 
            OP_0 OP_OUTPOINTTXHASH OP_CAT 
            OP_0 OP_OUTPOINTINDEX OP_4 OP_NUM2BIN OP_CAT 
            <0xfd> OP_CAT
            OP_0 OP_INPUTBYTECODE OP_SIZE OP_NIP OP_2 OP_SPLIT OP_DROP OP_CAT 
            OP_0 OP_INPUTBYTECODE OP_CAT 
            OP_0 OP_INPUTSEQUENCENUMBER OP_4 OP_NUM2BIN OP_CAT  
            OP_TXOUTPUTCOUNT OP_CAT 
            OP_0 OP_OUTPUTVALUE OP_8 OP_NUM2BIN OP_CAT 
            <0xb3ef> OP_CAT
            OP_0 OP_OUTPUTTOKENCATEGORY <32> OP_SPLIT OP_DROP OP_CAT 
            // Return Baton HAS_COMMITMENT_LENGTH, HAS_NFT, HAS_AMOUNT, is MUTABLE
            <0b01110001> OP_CAT
            // Return commitment is always 80-bytes long
            <100> OP_CAT
            OP_0 OP_OUTPUTTOKENCOMMITMENT OP_CAT 
            // Assume vault has > 4-bytes of token value
            // Will break ctor gimmic eventually
            <0xff> OP_CAT
            OP_0 OP_OUTPUTTOKENAMOUNT OP_8 OP_NUM2BIN OP_CAT 
            OP_0 OP_OUTPUTBYTECODE OP_CAT
            OP_1 OP_OUTPUTVALUE OP_8 OP_NUM2BIN OP_CAT 
            <0x44ef> OP_CAT
            OP_1 OP_OUTPUTTOKENCATEGORY OP_CAT
            // Transaction token reward HAS_AMOUNT
            <0b00010000> OP_CAT 
            // get the token amoumnt
            OP_OVER OP_CAT 
            OP_1 OP_OUTPUTBYTECODE OP_CAT 
            OP_0 OP_4 OP_NUM2BIN OP_CAT 
            

            // Get this transaction hash
            OP_DUP OP_HASH256 <32> OP_SPLIT OP_DROP OP_BIN2NUM OP_ABS 
            // int nextHash = abs(int(hash256(preimage).split(32)[0]));
            // Drop the transaction 
            OP_NIP 
            // Drop reward amount
            OP_NIP
          
            // Assure this hash is below target
            OP_OVER OP_LESSTHAN OP_VERIFY
            // require(nextHash < nextTarget>);

        //}   
    //}
      OP_2DROP OP_2DROP OP_2DROP
   OP_ENDIF OP_1
  //}`},wallet_lock:{lockingType:"standard",name:"Wallet Lock",script:"OP_DUP OP_HASH160 <$(<key.public_key> OP_HASH160)> OP_EQUALVERIFY OP_CHECKSIG"},message_packet:{name:"Nonce & Target",script:"0xabcdef"}},Ya=["BCH_2026_05"],ja={$schema:Ha,description:Va,name:Ka,entities:Fa,scenarios:qa,scripts:Xa,supported:Ya},Ga="@unspent/photon",$a={name:Ga},Et=N("29972959d6f0dc766cdcb81bfaf8171c5605a64dd0a81fa46080f84ac87c9bef");N("3cfdc81075ec7ea97c8c7438378fbd6a7a4a0bf98bcc2c7031b3581a59d6db5a");class Y{static USER_AGENT=$a.name;static tokenAware=!0;static template=ja;static compiler=ea(this.template);static vm=va();static getLockingBytecode(t={}){const a=this.compiler.generateBytecode({data:t,scriptId:"lock"});if(!a.success)throw new Error("Failed to generate bytecode, script: , "+JSON.stringify(a,null,"  "));return a.bytecode}static getScriptHash(t=!0){return ce(this.getLockingBytecode(),t)}static getAddress(t="bitcoincash"){return aa(this.getLockingBytecode(),t,this.tokenAware)}static getSourceOutput(t){return{lockingBytecode:this.getLockingBytecode(),valueSatoshis:BigInt(t.value),token:t.token_data?{category:N(t.token_data.category),amount:BigInt(t.token_data.amount),nft:t.token_data.nft?{commitment:N(t.token_data.nft.commitment),capability:t.token_data.nft.capability}:void 0}:void 0}}static getOracleInput(t){return{outpointIndex:t.tx_pos,outpointTransactionHash:N(t.tx_hash),sequenceNumber:0,unlockingBytecode:{data:{},compiler:this.compiler,script:"oracle",valueSatoshis:BigInt(t.value),token:t.token_data?{category:N(t.token_data.category),amount:BigInt(t.token_data.amount),nft:t.token_data.nft?{commitment:N(t.token_data.nft.commitment),capability:t.token_data.nft.capability}:void 0}:void 0}}}static getInput(t,a,r){return{outpointIndex:t.tx_pos,outpointTransactionHash:N(t.tx_hash),sequenceNumber:a,unlockingBytecode:{data:{bytecode:{age:jt(BigInt(a))},hdKeys:{addressIndex:0,hdPrivateKeys:{miner:r}}},compiler:this.compiler,script:"unlock",valueSatoshis:BigInt(t.value),token:t.token_data?{category:N(t.token_data.category),amount:BigInt(t.token_data.amount),nft:t.token_data.nft?{commitment:N(t.token_data.nft.commitment),capability:t.token_data.nft.capability}:void 0}:void 0}}}static getNextTarget(t,a){let r=t.height<=0?0:a-t.height,s=na(N(t.token_data?.nft?.commitment).slice(4,36));return ra(s*(BigInt(r)+143n)/144n)}static getOutput(t,a,r,s,l){let d=t.height<=0?0:r-t.height;const c=this.getNextTarget(t,r);let g=Uint8Array.from([...sa(l),...c]),O=ia.hash(g),u=oa(s);if(typeof u=="string")throw u;let p=ca(u.node,0),m=la.signMessageHashSchnorr(p.privateKey,O);if(typeof m=="string")throw m;return{lockingBytecode:{data:{bytecode:{age:jt(BigInt(d))},hdKeys:{addressIndex:0,hdPublicKeys:{miner:da(s).hdPublicKey}}},compiler:this.compiler,script:"lock"},valueSatoshis:BigInt(t.value-1500),token:{category:N(t.token_data.category),amount:BigInt(t.token_data?.amount)-BigInt(a),nft:{capability:"mutable",commitment:Uint8Array.from([...g,...m])}}}}static getOracleOutput(t,a){return{lockingBytecode:{data:{},compiler:this.compiler,script:"lock"},valueSatoshis:BigInt(t.value+a),token:{category:N(t.token_data.category),amount:BigInt(t.token_data?.amount),nft:{capability:"mutable",commitment:N(t.token_data?.nft?.commitment)}}}}static getRewardOutput(t,a,r=Et){let s=le(a);if(typeof s=="string")throw s;return{lockingBytecode:s.bytecode,valueSatoshis:700n,token:{category:r,amount:BigInt(t)}}}static topUp(t,a,r,s,l=0,d,c=1){let u={locktime:0,version:2,inputs:[],outputs:[]};u.inputs.push(this.getOracleInput(a)),u.outputs=[this.getOracleOutput(a,t)];const p=[this.getSourceOutput(a)],m=ua(r,BigInt(t),void 0,s,l);u.inputs.push(...m.inputs),p.push(...m.sourceOutputs);let P=fa(u.outputs),h=ha(p)-P;u.outputs.push(pa(h,0n,void 0,s));let T=vt(u);if(!T.success)throw new Error("generate transaction failed!, errors: "+JSON.stringify(T.errors,null,"  "));const A=ma(T.transaction,c),x=u.outputs.length-1;if(u.outputs[x].valueSatoshis=u.outputs[x].valueSatoshis-A,T=vt(u),!T.success)throw new Error("generate transaction failed!, errors: "+JSON.stringify(T.errors,null,"  "));let S=T.transaction;const L=_a(S,p,{maximumTokenCommitmentLength:128});if(L!==!0&&c>0)throw L;let R=this.vm.debug({inputIndex:0,sourceOutputs:p,transaction:S}),C=ga(Oa(R.slice(-9)));console.log(C);let k=Gt(p,d)-Gt(S.outputs,d);if(k!==0n)throw Error(`Claiming should not create or destroy tokens, token difference: ${k}`);return{sourceOutputs:p,transaction:S,verify:!1}}static generateTemplate(t,a,r,s,l,d=0){const c=[],g=[];let O=l?N(l):Et,u=a.height<=0?0:t-a.height;const p=Math.floor(Number(BigInt(a.token_data.amount)/420000n))-1;let m={locktime:0,version:2,inputs:c,outputs:g};m.inputs.push(this.getInput(a,u,r)),m.outputs=[this.getOutput(a,p,t,r,d)],m.outputs.push(this.getRewardOutput(p,s,O));let P=vt(m);if(!P.success)throw new Error("generate transaction failed!, errors: "+JSON.stringify(P.errors,null,"  "));let I=P.transaction;return this.getSourceOutput(a),j(de(I))}static getNextBatonUtxo(t){let a=kt(j(Pa(N(t)))),r=Ta(N(t));if(typeof r=="string")throw r;return{tx_pos:0,tx_hash:a,height:-1,value:Number(r.outputs[0].valueSatoshis),token_data:{nft:{commitment:j(r.outputs[0]?.token?.nft?.commitment),capability:"mutable"},amount:String(r.outputs[0]?.token?.amount),category:j(r.outputs[0]?.token?.category)}}}}var Wa=D('<h1>About Photons</h1> <p>Photon (PHOTON) is a solar punk meme token powering a decentralized energy oracle on Bitcoin Cash (BCH). It is a fairly distributed minable CashToken calculating its own transaction hash in BitcoinScript.</p> <p>Anyone can monetize their excess electricity by hashing for photons. Photons are released from the vault when someone finds the hash of the transaction is below a certain difficulty threshold. Each release of tokens must also update the hashing difficulty threshold. The difficulty <em>may</em> become correlated with the availability of excess free energy being absorbed by individuals globally.</p> <h2>Begin mining without sats</h2> <p>The Photon Vault keeps a cash balance to facilitate payments to miners. Each payout has an allowance of 1500 sats, for the dust accompanying a miner’s payout and the network fees for the transaction itself.</p> <h2>What is the PoW?</h2> <p>The PoW algorithm for Photons is Hash256(Secp256k1(Sha256)). Specifically, each transaction taking photons from the vault must return the mutable NFT baton with the following data updated:</p> <table><thead><tr><th align="left">Data</th><th align="left">Size</th></tr></thead><tbody><tr><td align="left">nonce</td><td align="left">4-bytes</td></tr><tr><td align="left">next target</td><td align="left">32-bytes (Little Endian)</td></tr><tr><td align="left">Schnorr signature of sha256(nonce + next target)</td><td align="left">64-bytes</td></tr></tbody></table> <p>When included in a transaction, satisfying a number of other requirements, if the double sha256 hash of the resulting transaction is less than the next target, the unlocking script for the photon vault can release a reward.</p> <h2>A decentralized energy oracle</h2> <p>Each miner taking tokens from the vault must update a dynamically changing difficulty value. The current <em>difficulty</em>, combined with the free market price of photons, creates a decentralized price oracle all miners contribute toward maintaining.</p> <p>If someone has already found a payout in this block, the difficulty gets one percent harder. If people stop taking tokens, the difficulty get easier each block.</p> <p>The vault contract also allows anyone to use the price baton for a fee (8000 sats). The price is intended to discourage resetting the oracle baton.</p> <h2>A simple Difficulty Adjustment Algorithm (DAA)</h2> <p>The target frequency for the price oracle is one update per block.</p> <p>The price oracle can be updated multiple times per block, but this makes mining 0.7% harder. If no reward is found in a block it gets 0.7% easier with each block. Mining becomes roughly 100% easier per day the oracle is not updated.</p> <p>The equation is a function of the baton transaction age (in block) and the previous difficulty target.</p> <p>NextTarget = ( PrevTarget * (143 + age) ) / 144</p> <p>The NextTarget MUST match the exact value given by the DAA, it may not be arbitrarily lowered by any miner.</p> <h2>Thanks</h2> <p>bitcoincashautist’s research provided valuable guidance on this idea & Adaptive Blocksize Limit .</p> <h2>See Also</h2> <ul><li>bitcoincashautist’s <a href="https://bitcoincashresearch.org/t/research-block-difficulty-as-a-price-oracle/1426" rel="nofollow">Research: Block difficulty as a price oracle</a></li> <li><a href="https://bitcoincashresearch.org/t/block-tops-btop-a-minable-cashtoken/" rel="nofollow">An early description</a> of this project (formerly BlockTops) Nov ‘25.</li> <li><a href="https://web.archive.org/web/20210128134553/https://mistcoin.org/" rel="nofollow">MIST: Mineable SLP Token - July 24, 2020</a></li> <li>SAFAs [forthcoming], which is a more sha256 ASIC friendly version of this contract.</li></ul>',1);function Qa(o){var t=Wa();bt(44),w(o,t)}function za(o){const t=o-1;return t*t*t+1}function ne(o){const t=typeof o=="string"&&o.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);return t?[parseFloat(t[1]),t[2]||"px"]:[o,"px"]}function Ja(o,{delay:t=0,duration:a=400,easing:r=za,x:s=0,y:l=0,opacity:d=0}={}){const c=getComputedStyle(o),g=+c.opacity,O=c.transform==="none"?"":c.transform,u=g*(1-d),[p,m]=ne(s),[P,I]=ne(l);return{delay:t,duration:a,easing:r,css:(h,T)=>`
			transform: ${O} translate(${(1-h)*p}${m}, ${(1-h)*P}${I});
			opacity: ${g-u*T}`}}var Za=De('<tspan dx="3" font-weight="bold"> </tspan><tspan dx="0.5" font-size="7"> </tspan>',1),tn=D('<main><svg viewBox="-50 -50 100 100" width="250" height="250"><title> </title><g fill="none" stroke="currentColor" stroke-width="2"><circle stroke="currentColor" r="46"></circle><path stroke="hsl(300, 90%, 50%)" d="M 0 -46 a 46 46 0 0 0 0 92 46 46 0 0 0 0 -92" pathLength="1" stroke-dasharray="1"></path></g><g fill="hsl(300, 90%, 50%)" stroke="none"><g><g transform="translate(0 -46)"><circle r="4"></circle></g></g></g><g fill="currentColor" text-anchor="middle" dominant-baseline="baseline" font-size="18"><text x="-3" y="6.5"></text></g></svg></main>');function en(o,t){ie(t,!1);const a=W(),r=W(),s=W(),l=W(),d=W();let c=Aa(t,"end",8),g=W(Date.now());const O=1e3;function u(){f(g,Date.now())}let p=setInterval(u,1e3),m=new ft(0,{duration:O,easing:yt}),P=new ft(360,{duration:O,easing:yt});function I(B,q=2,V="0"){const{length:X}=B.toString();return X>=q?B.toString():`${V.repeat(q-X)}${B}`}K(()=>(Xt(c()),e(g)),()=>{f(a,Math.round((c()-e(g))/1e3))}),K(()=>e(a),()=>{f(r,Math.floor(e(a)/3600))}),K(()=>(e(a),e(r)),()=>{f(s,Math.floor((e(a)-e(r)*3600)/60))}),K(()=>(e(a),e(r),e(s)),()=>{f(l,e(a)-e(r)*3600-e(s)*60)}),K(()=>(Xt(c()),e(g)),()=>{f(d,c()-e(g))}),K(()=>e(a),()=>{e(a)===0&&clearInterval(p)}),K(()=>(e(a),e(d)),()=>{m.set(Math.max(e(a)-1,0)/e(d))}),K(()=>(e(a),e(d)),()=>{P.set(Math.max(e(a)-1,0)/e(d)*360)}),je(),wa();var h=tn(),T=b(h),A=b(T),x=b(A);v(A);var S=_(A),L=_(b(S));v(S);var R=_(S),C=b(R);v(R);var k=_(R),H=b(k);Ea(H,5,()=>(e(r),e(s),e(l),st(()=>Object.entries({h:e(r),m:e(s),s:e(l)}))),Na,(B,q,V)=>{var X=Ge(()=>$e(e(q),2));let it=()=>e(X)[0],ot=()=>e(X)[1];var ct=Be(),lt=ut(ct);{var z=J=>{var Z=Za(),G=ut(Z),dt=b(G,!0);v(G);var tt=_(G),et=b(tt,!0);v(tt),F(at=>{U(dt,at),U(et,it())},[()=>(ot(),st(()=>I(ot())))]),w(J,Z)};Q(lt,J=>{e(d)>=60**(2-V)&&J(z)})}w(B,ct)}),v(H),v(k),v(T),v(h),F(()=>{U(x,`Remaining seconds: ${e(a)??""}`),M(L,"stroke-dashoffset",st(()=>m.current)),M(C,"transform",`rotate(${st(()=>P.current)??""})`)}),Ma(1,T,()=>Ja,()=>({y:-5})),w(o,h),oe()}const an="data:image/svg+xml,%3csvg%20width='400'%20height='400'%20version='1.1'%20viewBox='0%200%20106%20106'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%3e%3cdefs%3e%3cradialGradient%20id='a'%20cx='61'%20cy='5'%20r='53'%20gradientTransform='matrix(-.02%202%20-2%20-.02%2063%20-119)'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%230d0a75'%20stop-opacity='.8'%20offset='0'/%3e%3cstop%20stop-color='%2316124d'%20offset='1'/%3e%3c/radialGradient%3e%3clinearGradient%20id='b'%20x1='53'%20x2='13'%20y1='61'%20y2='51'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%23f6f4ca'%20offset='0'/%3e%3cstop%20stop-color='%23fff'%20stop-opacity='0'%20offset='1'/%3e%3c/linearGradient%3e%3cpattern%20id='bar'%20viewBox='0,0,10,10'%20width='10%25'%20height='10%25'%3e%3crect%20style='opacity:0.2;fill:%23ffffff;'%20height='1'%20width='10'/%3e%3c/pattern%3e%3c/defs%3e%3cpath%20d='m10%203-8%208v86l8%208h86l8-8v-86l-8-8z'%20fill='url(%23a)'/%3e%3cpath%20d='m10%203-8%208v86l8%208h86l8-8v-86l-8-8z'%20fill='url(%23bar)'/%3e%3cpath%20d='m24%2022c26-0.8%2037%2072%2028%2072-10%200.2%200.1-59%2026-85'%20fill='none'%20stroke='url(%23b)'%20stroke-linecap='round'%20stroke-width='5'/%3e%3c/svg%3e";var nn=D('<meta name="description" content="Emit Photons Tokens"/>'),rn=D("<img/>"),sn=D('<img alt="Disconnected"/>'),on=D('<button class="button svelte-1400jt5">go</button> <button class="button svelte-1400jt5">stop</button>',1),cn=D("<p> </p>"),ln=D('<h3>Vault Status</h3> <div class="swap svelte-1400jt5"><div class="svelte-1400jt5"><img width="50"/> <br/> <br/> <img width="18px"/></div></div> <h4>Current Difficulty</h4> <p>Current Target</p> <pre class="svelte-1400jt5"> </pre> <p>Previous Target</p> <pre class="svelte-1400jt5"> </pre> <br/> <br/> <br/> <p></p> <pre class="svelte-1400jt5"> </pre> <h3>Advanced</h3> <label class="switch svelte-1400jt5"><input type="checkbox" class="svelte-1400jt5"/> <span class="slider round svelte-1400jt5"></span></label>',1),dn=D('<div class="swap svelte-1400jt5"><!></div>'),un=D('<div class="swap svelte-1400jt5"><!> <p>awaiting baton</p></div>'),fn=D('<button class="button svelte-1400jt5">Donate 1M sats to mining baton.</button>'),hn=D('<section><div class="status svelte-1400jt5"> <sub>■</sub> <!> <!></div> <h1>Capture Photons</h1> <div class="swap svelte-1400jt5"><div class="svelte-1400jt5"><img width="50"/> <br/> </div></div> <div class="mining svelte-1400jt5"><!> <!> <p> </p></div> <!> <!> <!></section>');function Vn(o,t){ie(t,!0);let a,r,s=y("STATUS_IDLE"),l=y(!1),d=y(0),c=y(void 0),g="",O=y(void 0),u=y(""),p,m,P=y(Yt([])),I=y(Yt([])),h=y(""),T=y(""),A=y(0),x=y(0n),S=y(0),L=y(0n),R=y(0),C=y(""),k,H="";H=Y.getScriptHash();let B="bch.imaginary.cash";const q=an,V=j(Et),X="BCH",it="PHOTON",ot=Ba,ct=function(n){if(n.method==="blockchain.headers.subscribe"){let i=n.params[0];f(d,i.height,!0)}else n.method==="blockchain.scripthash.subscribe"?n.params[1]!==g&&(g=n.params[1],f(C,Jt[k.status],!0),dt(),G()):console.log(n)},lt=async function(){f(s,"STATUS_HALTED"),a.terminate(),await zt(100),await tt(),await zt(100)},z=async function(){let n=Y.generateTemplate(e(d),e(c),e(h),p.getTokenDepositAddress(),V);window.Worker?a.postMessage({task:"START",template:n,key:e(h)}):console.log("Start mining called before worker init.")},J=async function(){let n=Y.topUp(1e6,e(c),e(P),e(T)),i=j(de(n.transaction));await Z(i)},Z=async function(n){let i=await k.request("blockchain.transaction.broadcast",n);if(i instanceof Error)throw f(C,Jt[k.status],!0),i},G=async function(){let n=await k.request("blockchain.scripthash.listunspent",e(u),"include_tokens");if(n instanceof Error)throw n;f(P,n,!0),f(S,Wt(e(P),!0),!0),f(x,Qt(e(P),V),!0),f(P,e(P).filter(i=>!i.token_data),!0)},dt=async function(){let n=await k.request("blockchain.scripthash.listunspent",H,"include_tokens");if(n instanceof Error)throw n;if(n=n.filter(i=>i.token_data?.category==V).filter(i=>i.token_data?.nft?.capability=="mutable"),n.length==1){let i=n[0];e(c)||f(c,i,!0),i&&i.token_data&&i.token_data?.nft?.commitment!==e(c).token_data?.nft?.commitment&&(f(c,i,!0),e(s)=="STATUS_MINING"&&(await lt(),await z())),f(O,kt(e(c).token_data?.nft?.commitment.slice(8,72)),!0)}f(I,n,!0),f(R,Wt(n,!0),!0),f(L,Qt(n,V),!0)};async function tt(){if(window.Worker){f(s,"STATUS_IDLE"),r=void 0;const n=await Ce(()=>import("../chunks/DjknWfVy.js"),[],import.meta.url);a=new n.default,a.onmessage=function(i){const{status:E,message:$}=i.data;switch(E&&f(s,E,!0),E){case"STATUS_BROADCAST":r=i.data.result,f(A,i.data.hashRate,!0);try{Z(r)}catch(nt){console.error(nt)}f(c,Y.getNextBatonUtxo(r),!0),z();break}}}else console.error("no worker")}Re(async()=>{Ca.StorageProvider=xa,p=await te.named("vox"),m=await te.named("miner"),f(T,$t(p.mnemonic,p.derivationPath.slice(0,-2),p.isTestnet),!0),f(h,$t(m.mnemonic,m.derivationPath.slice(0,-2),m.isTestnet),!0);let n=le(p.getDepositAddress());if(typeof n=="string")throw n;f(u,ce(n.bytecode),!0),k=new ba(Y.USER_AGENT,"1.4.1",B),await k.connect(),k.on("notification",ct),await k.subscribe("blockchain.scripthash.subscribe",H),await k.subscribe("blockchain.scripthash.subscribe",e(u)),await k.subscribe("blockchain.headers.subscribe"),dt(),G(),tt()}),Me(async()=>{a.terminate(),await k.disconnect()});var et=hn();ze("1400jt5",n=>{var i=nn();re(()=>{We.title="γ Photons"}),w(n,i)});var at=b(et),Nt=b(at,!0),Ut=_(Nt,3);ka(Ut,{get template(){return Y.template}});var he=_(Ut,2);{var pe=n=>{var i=rn();F(()=>{M(i,"src",ya),M(i,"alt",e(C))}),w(n,i)},me=n=>{var i=sn();F(()=>M(i,"src",Ia)),w(n,i)};Q(he,n=>{e(C)=="CONNECTED"?n(pe):n(me,-1)})}v(at);var ht=_(at,4),wt=b(ht),pt=b(wt);M(pt,"alt",it);var _e=_(pt,3);v(wt),v(ht);var mt=_(ht,2),At=b(mt);{var ge=n=>{var i=on(),E=ut(i),$=_(E,2);F(()=>{E.disabled=e(s)=="STATUS_MINING",$.disabled=e(s)=="STATUS_IDLE"}),Tt("click",E,()=>z()),Tt("click",$,()=>lt()),w(n,i)};Q(At,n=>{e(c)&&n(ge)})}var St=_(At,2);{var Oe=n=>{var i=cn(),E=b(i);v(i),F(()=>U(E,`${e(A)??""} Hash/s`)),w(n,i)};Q(St,n=>{e(A)>0&&n(Oe)})}var xt=_(St,2),Pe=b(xt,!0);v(xt),v(mt);var Ct=_(mt,2);{var Te=n=>{var i=ln(),E=_(ut(i),2),$=b(E),nt=b($);M(nt,"alt",it);var Dt=_(nt,3),Rt=_(Dt,2),Mt=_(Rt);M(Mt,"alt",X),v($),v(E);var _t=_(E,6),Ie=b(_t,!0);v(_t);var gt=_(_t,4),Ee=b(gt,!0);v(gt);var Lt=_(gt),Ht=_(Lt,2),Vt=_(Ht,2),Kt=_(Vt,3);Kt.textContent="PHOTON category:";var Ot=_(Kt,2),Ne=b(Ot,!0);v(Ot);var Ft=_(Ot,4),qt=b(Ft);Je(qt),bt(2),v(Ft),F((Pt,Ue,we,Ae,Se,xe)=>{M(nt,"src",q),U(Dt,` ${Pt??""}
				PHOTON`),U(Rt,` ${Ue??""}
				BCH `),M(Mt,"src",ot),U(Ie,we),U(Ee,Ae),U(Lt,` Height: ${e(c).height??""} `),U(Ht,` Next Payout: ${Se??""}
		PHOTON`),U(Vt,` Cash: ${xe??""} sats BCH`),U(Ne,e(c).token_data?.category)},[()=>(e(L)/100000000n).toLocaleString(),()=>(e(R)/1e8).toLocaleString(),()=>j(Y.getNextTarget(e(c),e(d))),()=>kt(e(O)),()=>(Number(BigInt(e(c).token_data?.amount)/420000n)/1e8).toLocaleString(void 0,{maximumFractionDigits:5}),()=>e(c).value.toLocaleString()]),ta(qt,()=>e(l),Pt=>f(l,Pt)),w(n,i)},ve=n=>{var i=dn(),E=b(i);en(E,{end:1786209657e3}),v(i),w(n,i)},be=n=>{var i=un(),E=b(i);Sa(E),bt(2),v(i),w(n,i)};Q(Ct,n=>{e(c)&&e(c).value>0?n(Te):Date.now()<1786209657e3?n(ve,2):n(be,-1)})}var Bt=_(Ct,2);{var ke=n=>{var i=fn();Tt("click",i,()=>J()),w(n,i)};Q(Bt,n=>{e(l)&&n(ke)})}var ye=_(Bt,2);Qa(ye),v(et),F((n,i)=>{U(Nt,n),M(pt,"src",q),U(_e,` ${i??""}
			PHOTON`),U(Pe,e(s))},[()=>e(d).toLocaleString(),()=>(e(x)/100000000n).toLocaleString(void 0,{maximumFractionDigits:5})]),w(o,et),oe()}Ze(["click"]);export{Vn as component,Hn as universal};
//# sourceMappingURL=11.Cd-GjnE-.js.map
