import{_ as He}from"../chunks/Ct5FWWRu.js";import{f as C,a as A,c as Ve,d as Ke}from"../chunks/Bu6ML9vF.js";import{o as Fe,a as qe}from"../chunks/Cj7IOai5.js";import{o as Xe,E as Ge,bv as je,b3 as Ye,m as ce,u as nt,bw as $e,aA as We,a0 as ze,am as at,aF as le,a_ as E,n as Qe,ap as p,w as e,aI as It,p as de,br as q,L as J,a8 as Yt,bs as Je,c as T,r as v,s as _,f as dt,t as F,a as ue,ac as Ze,bx as ta,as as $t,aG as ea}from"../chunks/DBfwBvaO.js";import{a as aa,s as U}from"../chunks/CNn2VpyY.js";import{i as Z}from"../chunks/CYslEwOP.js";import{h as na}from"../chunks/DdDsCLaS.js";import{a as R,r as ra}from"../chunks/DKCD-EU9.js";import{d as sa,a as lt}from"../chunks/CNwA4967.js";import{a as ia}from"../chunks/Bgkbd40-.js";import{p as oa}from"../chunks/DZpys8KO.js";import{h as w,g as ca,k as fe,l as la,n as Wt,a2 as da,a3 as ua,a4 as fa,a5 as pa,a6 as ha,a7 as ma,a8 as _a,p as ga,w as pe,a9 as Oa,Q as Pa,s as va,S as Ta,m as kt,q as ba,v as ya,aa as ka,ab as Ia,r as zt,b as G,B as he,K as Et,L as Ea,J as Na,z as Qt,A as Jt,E as Zt,C as te}from"../chunks/ByPxBN1k.js";import{c as wa}from"../chunks/DQfTg77v.js";import{e as Ua,C as ee}from"../chunks/hh7Yrpmc.js";import"../chunks/Dxr8WnRF.js";import{B as Aa}from"../chunks/0kSKe6zz.js";import{C as xa}from"../chunks/B7hCbxZp.js";import{D as Sa}from"../chunks/DMvn4Q5j.js";import{e as Ca,i as Ba}from"../chunks/IJZZyriy.js";import{l as me,r as Da,i as ae}from"../chunks/BVcIytND.js";import{i as Ma}from"../chunks/BzWO7PBX.js";import{p as Ra}from"../chunks/BSxBgH8s.js";import{L as La}from"../chunks/DhjoiuKW.js";import{I as Ha,B as Va,W as ne,T as re}from"../chunks/BP0hEv9D.js";import{B as Ka}from"../chunks/DHD6zs4M.js";import{t as Fa}from"../chunks/CUR0D9Jq.js";function se(o,t){le(()=>{o.dispatchEvent(new CustomEvent(t))})}function qa(o){if(o==="float")return"cssFloat";if(o==="offset")return"cssOffset";if(o.startsWith("--"))return o;const t=o.split("-");return t.length===1?t[0]:t[0]+t.slice(1).map(n=>n[0].toUpperCase()+n.slice(1)).join("")}function ie(o){const t={},n=o.split(";");for(const r of n){const[i,l]=r.split(":");if(!i||l===void 0)break;const d=qa(i.trim());t[d]=l.trim()}return t}const Xa=o=>o;function Ga(o,t,n,r){var i=(o&$e)!==0,l="in",d,c=t.inert,g=t.style.overflow,O,u;function f(){return le(()=>d??=n()(t,r?.()??{},{direction:l}))}var m={is_global:i,in(){t.inert=c,O?.abort(),O=_e(t,f(),u,1,()=>{se(t,"introstart")},()=>{se(t,"introend"),O?.abort(),O=d=void 0,t.style.overflow=g})},out(b){{b?.(),d=void 0;return}},stop:()=>{O?.abort()}},P=Xe;if((P.nodes.t??=[]).push(m),aa){var N=i;if(!N){for(var h=P.parent;h&&(h.f&Ge)!==0;)for(;(h=h.parent)&&(h.f&je)===0;);N=!h||(h.f&Ye)!==0}N&&ce(()=>{nt(()=>m.in())})}}function _e(o,t,n,r,i,l){if(We(t)){var d,c=!1;return ze(()=>{if(!c){var b=t({direction:"in"});d=_e(o,b,n,r,i,l)}}),{abort:()=>{c=!0,d?.abort()},deactivate:()=>d.deactivate(),reset:()=>d.reset(),t:()=>d.t()}}if(!t?.duration&&!t?.delay)return i(),l(),{abort:at,deactivate:at,reset:at,t:()=>r};const{delay:g=0,css:O,tick:u,easing:f=Xa}=t;var m=[];if(u&&u(0,1),O){var P=ie(O(0,1));m.push(P,P)}var N=()=>1-r,h=o.animate(m,{duration:g,fill:"forwards"});return h.onfinish=()=>{h.cancel(),i();var b=1-r,x=r-b,B=t.duration*Math.abs(x),S=[];if(B>0){var L=!1;if(O)for(var M=Math.ceil(B/16.666666666666668),D=0;D<=M;D+=1){var y=b+x*f(D/M),V=ie(O(y,1-y));S.push(V),L||=V.overflow==="hidden"}L&&(o.style.overflow="hidden"),N=()=>{var k=h.currentTime;return b+x*f(k/B)},u&&me(()=>{if(h.playState!=="running")return!1;var k=N();return u(k,1-k),!0})}h=o.animate(S,{duration:B,fill:"forwards"}),h.onfinish=()=>{N=()=>r,u?.(r,1-r),l()}},{abort:()=>{h&&(h.cancel(),h.effect=null,h.onfinish=at)},deactivate:()=>{l=at},reset:()=>{},t:()=>N()}}function Nt(o){return o}function wt(o,t){if(o===t||o!==o)return()=>o;const n=typeof o;if(n!==typeof t||Array.isArray(o)!==Array.isArray(t))throw new Error("Cannot interpolate values of different type");if(Array.isArray(o)){const r=t.map((i,l)=>wt(o[l],i));return i=>r.map(l=>l(i))}if(n==="object"){if(!o||!t)throw new Error("Object cannot be null");if(ae(o)&&ae(t)){const l=o.getTime(),c=t.getTime()-l;return g=>new Date(l+g*c)}const r=Object.keys(t),i={};return r.forEach(l=>{i[l]=wt(o[l],t[l])}),l=>{const d={};return r.forEach(c=>{d[c]=i[c](l)}),d}}if(n==="number"){const r=t-o;return i=>o+i*r}return()=>t}class ut{#t;#a;#n;#e=null;constructor(t,n={}){this.#t=E(t),this.#a=E(t),this.#n=n}static of(t,n){const r=new ut(t(),n);return Qe(()=>{r.set(t())}),r}set(t,n){p(this.#a,t);let{delay:r=0,duration:i=400,easing:l=Nt,interpolate:d=wt}={...this.#n,...n};if(i===0)return this.#e?.abort(),p(this.#t,t),Promise.resolve();const c=Da.now()+r;let g,O=!1,u=this.#e;return this.#e=me(f=>{if(f<c)return!0;if(!O){O=!0;const P=this.#t.v;g=d(P,t),typeof i=="function"&&(i=i(P,t)),u?.abort(),u=null}const m=f-c;return m>i?(p(this.#t,t),!1):(p(this.#t,g(l(m/i))),!0)}),this.#e.promise}get current(){return e(this.#t)}get target(){return e(this.#a)}set target(t){this.set(t)}}const ja=!0,Qn=Object.freeze(Object.defineProperty({__proto__:null,prerender:ja},Symbol.toStringTag,{value:"Module"})),Ya="https://libauth.org/schemas/wallet-template-v0.schema.json",$a="Photons: A minable CashToken and decentralized energy oracle",Wa="Photons",za={covenant:{description:"Emit tokens if a transaction hash is low enough. Or, alternatively, allow anyone to use the vault thread as an oracle for a fee.",name:"Photon Vault",scripts:["lock","unlock"],variables:{age:{description:"The input age (as a number of blocks) claimed to withdraw tokens. The maximum age that can be used to claim tokens is the lessor of covenant thread age or user coins age being used to release tokens.",name:"Age",type:"WalletData"}}},miner:{description:"",name:"Mining Entity",scripts:["unlock","lock"],variables:{miner_key:{description:"The private key that controls this wallet.",name:"Key",type:"HdKey"}}},wallet:{description:"",name:"Funding Entity",scripts:["wallet_unlock","wallet_lock"],variables:{key:{description:"The private key that controls this wallet.",name:"Key",type:"HdKey"}}}},Qa={release:{data:{bytecode:{age:"0"}},description:"",name:"Release Tokens",transaction:{inputs:[{outpointTransactionHash:"ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",outpointIndex:0,unlockingBytecode:["slot"],sequenceNumber:0}],outputs:[{lockingBytecode:{script:"lock"},valueSatoshis:1200,token:{amount:"2099995000000001",category:"deaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddead",nft:{capability:"mutable",commitment:"123456781f815ab0fb6d8064933edfa60e48ccccc2df9c2b055ba6182b0f3ee989811b7fdeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeadad"}}},{lockingBytecode:{script:"wallet_lock"},valueSatoshis:675,token:{amount:"4999999999",category:"deaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddead"}}],locktime:0,version:2},sourceOutputs:[{lockingBytecode:["slot"],valueSatoshis:2375,token:{amount:"2100000000000000",category:"deaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddead",nft:{capability:"mutable",commitment:"040000009863bfb8140e6a63bfb8140e6a63bfb8140e6a63bfb8140e6a63bfb8140effffdeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddead0000000012341234ffffffff"}}}]}},Ja={unlock:{passes:["release"],name:"Unlock Tokens",script:`<miner_key.public_key> <age> //
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
  //}`},wallet_lock:{lockingType:"standard",name:"Wallet Lock",script:"OP_DUP OP_HASH160 <$(<key.public_key> OP_HASH160)> OP_EQUALVERIFY OP_CHECKSIG"},message_packet:{name:"Nonce & Target",script:"0xabcdef"}},Za=["BCH_2026_05"],tn={$schema:Ya,description:$a,name:Wa,entities:za,scenarios:Qa,scripts:Ja,supported:Za},en="@unspent/photon",an={name:en},Ut=w("29972959d6f0dc766cdcb81bfaf8171c5605a64dd0a81fa46080f84ac87c9bef"),nn=w("3cfdc81075ec7ea97c8c7438378fbd6a7a4a0bf98bcc2c7031b3581a59d6db5a");class X{static USER_AGENT=an.name;static tokenAware=!0;static template=tn;static compiler=ca(this.template);static vm=wa();static getLockingBytecode(t={}){const n=this.compiler.generateBytecode({data:t,scriptId:"lock"});if(!n.success)throw new Error("Failed to generate bytecode, script: , "+JSON.stringify(n,null,"  "));return n.bytecode}static getScriptHash(t=!0){return fe(this.getLockingBytecode(),t)}static getAddress(t="bitcoincash"){return la(this.getLockingBytecode(),t,this.tokenAware)}static getSourceOutput(t){return{lockingBytecode:this.getLockingBytecode(),valueSatoshis:BigInt(t.value),token:t.token_data?{category:w(t.token_data.category),amount:BigInt(t.token_data.amount),nft:t.token_data.nft?{commitment:w(t.token_data.nft.commitment),capability:t.token_data.nft.capability}:void 0}:void 0}}static getOracleInput(t){return{outpointIndex:t.tx_pos,outpointTransactionHash:w(t.tx_hash),sequenceNumber:0,unlockingBytecode:{data:{},compiler:this.compiler,script:"oracle",valueSatoshis:BigInt(t.value),token:t.token_data?{category:w(t.token_data.category),amount:BigInt(t.token_data.amount),nft:t.token_data.nft?{commitment:w(t.token_data.nft.commitment),capability:t.token_data.nft.capability}:void 0}:void 0}}}static getInput(t,n,r){return{outpointIndex:t.tx_pos,outpointTransactionHash:w(t.tx_hash),sequenceNumber:n,unlockingBytecode:{data:{bytecode:{age:Wt(BigInt(n))},hdKeys:{addressIndex:0,hdPrivateKeys:{miner:r}}},compiler:this.compiler,script:"unlock",valueSatoshis:BigInt(t.value),token:t.token_data?{category:w(t.token_data.category),amount:BigInt(t.token_data.amount),nft:t.token_data.nft?{commitment:w(t.token_data.nft.commitment),capability:t.token_data.nft.capability}:void 0}:void 0}}}static getNextTarget(t,n){let r=t.height<=0?0:n-t.height,i=da(w(t.token_data?.nft?.commitment).slice(4,36));return ua(i*(BigInt(r)+143n)/144n)}static getOutput(t,n,r,i,l){let d=t.height<=0?0:r-t.height;const c=this.getNextTarget(t,r);let g=Uint8Array.from([...fa(l),...c]),O=pa.hash(g),u=ha(i);if(typeof u=="string")throw u;let f=ma(u.node,0),m=_a.signMessageHashSchnorr(f.privateKey,O);if(typeof m=="string")throw m;return{lockingBytecode:{data:{bytecode:{age:Wt(BigInt(d))},hdKeys:{addressIndex:0,hdPublicKeys:{miner:ga(i).hdPublicKey}}},compiler:this.compiler,script:"lock"},valueSatoshis:BigInt(t.value-1500),token:{category:w(t.token_data.category),amount:BigInt(t.token_data?.amount)-BigInt(n),nft:{capability:"mutable",commitment:Uint8Array.from([...g,...m])}}}}static getOracleOutput(t,n){return{lockingBytecode:{data:{},compiler:this.compiler,script:"lock"},valueSatoshis:BigInt(t.value+n),token:{category:w(t.token_data.category),amount:BigInt(t.token_data?.amount),nft:{capability:"mutable",commitment:w(t.token_data?.nft?.commitment)}}}}static getRewardOutput(t,n,r=Ut){let i=pe(n);if(typeof i=="string")throw i;return{lockingBytecode:i.bytecode,valueSatoshis:700n,token:{category:r,amount:BigInt(t)}}}static topUp(t,n,r,i,l=0,d,c=1){let u={locktime:0,version:2,inputs:[],outputs:[]};u.inputs.push(this.getOracleInput(n)),u.outputs=[this.getOracleOutput(n,t)];const f=[this.getSourceOutput(n)],m=Oa(r,BigInt(t),void 0,i,l);u.inputs.push(...m.inputs),f.push(...m.sourceOutputs);let P=Pa(u.outputs),h=va(f)-P;u.outputs.push(Ta(h,0n,void 0,i));let b=kt(u);if(!b.success)throw new Error("generate transaction failed!, errors: "+JSON.stringify(b.errors,null,"  "));const x=ba(b.transaction,c),B=u.outputs.length-1;if(u.outputs[B].valueSatoshis=u.outputs[B].valueSatoshis-x,b=kt(u),!b.success)throw new Error("generate transaction failed!, errors: "+JSON.stringify(b.errors,null,"  "));let S=b.transaction;const L=ya(S,f,{maximumTokenCommitmentLength:128});if(L!==!0&&c>0)throw L;let M=this.vm.debug({inputIndex:0,sourceOutputs:f,transaction:S}),D=ka(Ia(M.slice(-9)));console.log(D);let y=zt(f,d)-zt(S.outputs,d);if(y!==0n)throw Error(`Claiming should not create or destroy tokens, token difference: ${y}`);return{sourceOutputs:f,transaction:S,verify:!1}}static generateTemplate(t,n,r,i,l,d=0){const c=[],g=[];let O=l?w(l):Ut,u=n.height<=0?0:t-n.height;const f=Math.floor(Number(BigInt(n.token_data.amount)/420000n))-1;let m={locktime:0,version:2,inputs:c,outputs:g};m.inputs.push(this.getInput(n,u,r)),m.outputs=[this.getOutput(n,f,t,r,d)],m.outputs.push(this.getRewardOutput(f,i,O));let P=kt(m);if(!P.success)throw new Error("generate transaction failed!, errors: "+JSON.stringify(P.errors,null,"  "));let N=P.transaction;return this.getSourceOutput(n),G(he(N))}static getNextBatonUtxo(t){let n=Et(G(Ea(w(t)))),r=Na(w(t));if(typeof r=="string")throw r;return{tx_pos:0,tx_hash:n,height:-1,value:Number(r.outputs[0].valueSatoshis),token_data:{nft:{commitment:G(r.outputs[0]?.token?.nft?.commitment),capability:"mutable"},amount:String(r.outputs[0]?.token?.amount),category:G(r.outputs[0]?.token?.category)}}}}var rn=C('<h1>About Photons</h1> <p>Photon (PHOTON) is a solar punk meme token powering a decentralized energy oracle on Bitcoin Cash (BCH). It is a fairly distributed minable CashToken calculating its own transaction hash in BitcoinScript.</p> <p>Anyone can monetize their excess electricity by hashing for photons. Photons are released from the vault when someone finds the hash of the transaction is below a certain difficulty threshold. Each release of tokens must also update the hashing difficulty threshold. The difficulty <em>may</em> become correlated with the availability of excess free energy being absorbed by individuals globally.</p> <h2>Begin mining without sats</h2> <p>The Photon Vault keeps a cash balance to facilitate payments to miners. Each payout has an allowance of 1500 sats, for the dust accompanying a miner’s payout and the network fees for the transaction itself.</p> <h2>What is the PoW?</h2> <p>The PoW algorithm for Photons is Hash256(Secp256k1(Sha256)). Specifically, each transaction taking photons from the vault must return the mutable NFT baton with the following data updated:</p> <table><thead><tr><th align="left">Data</th><th align="left">Size</th></tr></thead><tbody><tr><td align="left">nonce</td><td align="left">4-bytes</td></tr><tr><td align="left">next target</td><td align="left">32-bytes (Little Endian)</td></tr><tr><td align="left">Schnorr signature of sha256(nonce + next target)</td><td align="left">64-bytes</td></tr></tbody></table> <p>When included in a transaction, satisfying a number of other requirements, if the double sha256 hash of the resulting transaction is less than the next target, the unlocking script for the photon vault can release a reward.</p> <h2>A decentralized energy oracle</h2> <p>Each miner taking tokens from the vault must update a dynamically changing difficulty value. The current <em>difficulty</em>, combined with the free market price of photons, creates a decentralized price oracle all miners contribute toward maintaining.</p> <p>If someone has already found a payout in this block, the difficulty gets one percent harder. If people stop taking tokens, the difficulty get easier each block.</p> <p>The vault contract also allows anyone to use the price baton for a fee (8000 sats). The price is intended to discourage resetting the oracle baton.</p> <h2>A simple Difficulty Adjustment Algorithm (DAA)</h2> <p>The target frequency for the price oracle is one update per block.</p> <p>The price oracle can be updated multiple times per block, but this makes mining 0.7% harder. If no reward is found in a block it gets 0.7% easier with each block. Mining becomes roughly 100% easier per day the oracle is not updated.</p> <p>The equation is a function of the baton transaction age (in block) and the previous difficulty target.</p> <p>NextTarget = ( PrevTarget * (143 + age) ) / 144</p> <p>The NextTarget MUST match the exact value given by the DAA, it may not be arbitrarily lowered by any miner.</p> <h2>Thanks</h2> <p>bitcoincashautist’s research provided valuable guidance on this idea & Adaptive Blocksize Limit .</p> <h2>See Also</h2> <ul><li>bitcoincashautist’s <a href="https://bitcoincashresearch.org/t/research-block-difficulty-as-a-price-oracle/1426" rel="nofollow">Research: Block difficulty as a price oracle</a></li> <li><a href="https://bitcoincashresearch.org/t/block-tops-btop-a-minable-cashtoken/" rel="nofollow">An early description</a> of this project (formerly BlockTops) Nov ‘25.</li> <li><a href="https://web.archive.org/web/20210128134553/https://mistcoin.org/" rel="nofollow">MIST: Mineable SLP Token - July 24, 2020</a></li> <li>SAFAs [forthcoming], which is a more sha256 ASIC friendly version of this contract.</li></ul>',1);function sn(o){var t=rn();It(44),A(o,t)}function on(o){const t=o-1;return t*t*t+1}function oe(o){const t=typeof o=="string"&&o.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);return t?[parseFloat(t[1]),t[2]||"px"]:[o,"px"]}function cn(o,{delay:t=0,duration:n=400,easing:r=on,x:i=0,y:l=0,opacity:d=0}={}){const c=getComputedStyle(o),g=+c.opacity,O=c.transform==="none"?"":c.transform,u=g*(1-d),[f,m]=oe(i),[P,N]=oe(l);return{delay:t,duration:n,easing:r,css:(h,b)=>`
			transform: ${O} translate(${(1-h)*f}${m}, ${(1-h)*P}${N});
			opacity: ${g-u*b}`}}var ln=Ke('<tspan dx="3" font-weight="bold"> </tspan><tspan dx="0.5" font-size="7"> </tspan>',1),dn=C('<main><svg viewBox="-50 -50 100 100" width="250" height="250"><title> </title><g fill="none" stroke="currentColor" stroke-width="2"><circle stroke="currentColor" r="46"></circle><path stroke="hsl(300, 90%, 50%)" d="M 0 -46 a 46 46 0 0 0 0 92 46 46 0 0 0 0 -92" pathLength="1" stroke-dasharray="1"></path></g><g fill="hsl(300, 90%, 50%)" stroke="none"><g><g transform="translate(0 -46)"><circle r="4"></circle></g></g></g><g fill="currentColor" text-anchor="middle" dominant-baseline="baseline" font-size="18"><text x="-3" y="6.5"></text></g></svg></main>');function un(o,t){de(t,!1);const n=J(),r=J(),i=J(),l=J(),d=J();let c=Ra(t,"end",8),g=J(Date.now());const O=1e3;function u(){p(g,Date.now())}let f=setInterval(u,1e3),m=new ut(0,{duration:O,easing:Nt}),P=new ut(360,{duration:O,easing:Nt});function N(k,j=2,Y="0"){const{length:H}=k.toString();return H>=j?k.toString():`${Y.repeat(j-H)}${k}`}q(()=>(Yt(c()),e(g)),()=>{p(n,Math.round((c()-e(g))/1e3))}),q(()=>e(n),()=>{p(r,Math.floor(e(n)/3600))}),q(()=>(e(n),e(r)),()=>{p(i,Math.floor((e(n)-e(r)*3600)/60))}),q(()=>(e(n),e(r),e(i)),()=>{p(l,e(n)-e(r)*3600-e(i)*60)}),q(()=>(Yt(c()),e(g)),()=>{p(d,c()-e(g))}),q(()=>e(n),()=>{e(n)===0&&clearInterval(f)}),q(()=>(e(n),e(d)),()=>{m.set(Math.max(e(n)-1,0)/e(d))}),q(()=>(e(n),e(d)),()=>{P.set(Math.max(e(n)-1,0)/e(d)*360)}),Je(),Ma();var h=dn(),b=T(h),x=T(b),B=T(x);v(x);var S=_(x),L=_(T(S));v(S);var M=_(S),D=T(M);v(M);var y=_(M),V=T(y);Ca(V,5,()=>(e(r),e(i),e(l),nt(()=>Object.entries({h:e(r),m:e(i),s:e(l)}))),Ba,(k,j,Y)=>{var H=Ze(()=>ta(e(j),2));let $=()=>e(H)[0],K=()=>e(H)[1];var rt=Ve(),ft=dt(rt);{var pt=W=>{var z=ln(),tt=dt(z),st=T(tt,!0);v(tt);var it=_(tt),ot=T(it,!0);v(it),F(ct=>{U(st,ct),U(ot,$())},[()=>(K(),nt(()=>N(K())))]),A(W,z)};Z(ft,W=>{e(d)>=60**(2-Y)&&W(pt)})}A(k,rt)}),v(V),v(y),v(b),v(h),F(()=>{U(B,`Remaining seconds: ${e(n)??""}`),R(L,"stroke-dashoffset",nt(()=>m.current)),R(D,"transform",`rotate(${nt(()=>P.current)??""})`)}),Ga(1,b,()=>cn,()=>({y:-5})),A(o,h),ue()}const fn="data:image/svg+xml,%3csvg%20width='400'%20height='400'%20version='1.1'%20viewBox='0%200%20106%20106'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%3e%3cdefs%3e%3cradialGradient%20id='a'%20cx='61'%20cy='5'%20r='53'%20gradientTransform='matrix(-.02%202%20-2%20-.02%2063%20-119)'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%23753e0a'%20stop-opacity='.8'%20offset='0'/%3e%3cstop%20stop-color='%2316124d'%20offset='1'/%3e%3c/radialGradient%3e%3clinearGradient%20id='b'%20x1='53'%20x2='13'%20y1='61'%20y2='51'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%23f6f4ca'%20offset='0'/%3e%3cstop%20stop-color='%23fff'%20stop-opacity='0'%20offset='1'/%3e%3c/linearGradient%3e%3cpattern%20id='bar'%20viewBox='0,0,10,10'%20width='10%25'%20height='10%25'%3e%3cpolygon%20style='opacity:0.2;fill:%23fff;'%20points='0,5%200,6%2010,6%2010,5'/%3e%3c/pattern%3e%3c/defs%3e%3cpath%20d='m10%203-8%208v86l8%208h86l8-8v-86l-8-8z'%20fill='url(%23a)'/%3e%3cpath%20d='m10%203-8%208v86l8%208h86l8-8v-86l-8-8z'%20fill='url(%23bar)'/%3e%3cpath%20d='m24%2022c26-0.8%2037%2072%2028%2072-10%200.2%200.1-59%2026-85'%20fill='none'%20stroke='url(%23b)'%20stroke-linecap='round'%20stroke-width='5'/%3e%3c/svg%3e",pn="data:image/svg+xml,%3csvg%20width='400'%20height='400'%20version='1.1'%20viewBox='0%200%20106%20106'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%3e%3cdefs%3e%3cradialGradient%20id='a'%20cx='61'%20cy='5'%20r='53'%20gradientTransform='matrix(-.02%202%20-2%20-.02%2063%20-119)'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%230d0a75'%20stop-opacity='.8'%20offset='0'/%3e%3cstop%20stop-color='%2316124d'%20offset='1'/%3e%3c/radialGradient%3e%3clinearGradient%20id='b'%20x1='53'%20x2='13'%20y1='61'%20y2='51'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%23f6f4ca'%20offset='0'/%3e%3cstop%20stop-color='%23fff'%20stop-opacity='0'%20offset='1'/%3e%3c/linearGradient%3e%3cpattern%20id='bar'%20viewBox='0,0,10,10'%20width='10%25'%20height='10%25'%3e%3crect%20style='opacity:0.2;fill:%23ffffff;'%20height='1'%20width='10'/%3e%3c/pattern%3e%3c/defs%3e%3cpath%20d='m10%203-8%208v86l8%208h86l8-8v-86l-8-8z'%20fill='url(%23a)'/%3e%3cpath%20d='m10%203-8%208v86l8%208h86l8-8v-86l-8-8z'%20fill='url(%23bar)'/%3e%3cpath%20d='m24%2022c26-0.8%2037%2072%2028%2072-10%200.2%200.1-59%2026-85'%20fill='none'%20stroke='url(%23b)'%20stroke-linecap='round'%20stroke-width='5'/%3e%3c/svg%3e";var hn=C('<meta name="description" content="Emit Photons Tokens"/>'),mn=C("<img/>"),_n=C('<img alt="Disconnected"/>'),gn=C('<button class="button svelte-1400jt5">go</button> <button class="button svelte-1400jt5">stop</button>',1),On=C("<p> </p>"),Pn=C('<h3>Vault Status</h3> <div class="swap svelte-1400jt5"><div class="svelte-1400jt5"><img width="50"/> <br/> <br/> <img width="18px"/></div></div> <h4>Current Difficulty</h4> <p>Current Target</p> <pre class="svelte-1400jt5"> </pre> <p>Previous Target</p> <pre class="svelte-1400jt5"> </pre> <br/> <br/> <br/> <p> </p> <pre class="svelte-1400jt5"> </pre> <h3>Advanced</h3> <label class="switch svelte-1400jt5"><input type="checkbox" class="svelte-1400jt5"/> <span class="slider round svelte-1400jt5"></span></label>',1),vn=C('<button class="button svelte-1400jt5"> </button>'),Tn=C('<div class="swap svelte-1400jt5"><!></div>'),bn=C('<div class="swap svelte-1400jt5"><!> <p>awaiting baton</p></div>'),yn=C('<button class="button svelte-1400jt5">Donate 1M sats to mining baton.</button>'),kn=C('<section><div class="status svelte-1400jt5"> <sub>■</sub> <!> <!></div> <h1>Capture Photons</h1> <div class="swap svelte-1400jt5"><div class="svelte-1400jt5"><img width="50"/> <br/> </div></div> <div class="mining svelte-1400jt5"><!> <!> <p> </p></div> <!> <!> <!></section>');function Jn(o,t){de(t,!0);let n,r,i=E("STATUS_IDLE"),l=E(!1),d=E(0),c=E(void 0),g="",O=E(void 0),u=E(""),f,m,P=E($t([])),N=E($t([])),h=E(""),b=E(""),x=E(0),B=E(0n),S=E(0),L=E(0n),M=E(0),D=E(""),y,V="";V=X.getScriptHash();const k=oa.url.hostname=="vox.cash";let j=k?"bch.imaginary.cash":"chipnet.bch.ninja";const Y=k?pn:fn,H=k?G(Ut):G(nn),$=k?"BCH":"tBCH",K=k?"PHOTON":"tPHOTON",rt=k?"bitcoincash":"bchtest",ft=k?Ka:Fa,pt=function(a){if(a.method==="blockchain.headers.subscribe"){let s=a.params[0];p(d,s.height,!0)}else a.method==="blockchain.scripthash.subscribe"?a.params[1]!==g&&(g=a.params[1],p(D,ee[y.status],!0),ct(),ot()):console.log(a)},W=async function(){p(i,"STATUS_HALTED"),n.terminate(),await te(100),await At(),await te(100)},z=async function(){let a=X.generateTemplate(e(d),e(c),e(h),f.getTokenDepositAddress(),H);window.Worker?n.postMessage({task:"START",template:a,key:e(h)}):console.log("Start mining called before worker init.")},tt=async function(){let a=X.topUp(1e6,e(c),e(P),e(b)),s=G(he(a.transaction));await st(s)},st=async function(a){let s=await y.request("blockchain.transaction.broadcast",a);if(s instanceof Error)throw p(D,ee[y.status],!0),s},it=async function(){await f.sendMax(f.getDepositAddress());let a=await f.tokenGenesis({cashaddr:X.getAddress(rt),amount:BigInt(21e14),value:50000000n,nft:{capability:"mutable",commitment:"00000000fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000"}});console.log(a)},ot=async function(){let a=await y.request("blockchain.scripthash.listunspent",e(u),"include_tokens");if(a instanceof Error)throw a;p(P,a,!0),p(S,Jt(e(P),!0),!0),p(B,Zt(e(P),H),!0),p(P,e(P).filter(s=>!s.token_data),!0)},ct=async function(){let a=await y.request("blockchain.scripthash.listunspent",V,"include_tokens");if(a instanceof Error)throw a;if(a=a.filter(s=>s.token_data?.category==H).filter(s=>s.token_data?.nft?.capability=="mutable"),a.length==1){let s=a[0];e(c)||p(c,s,!0),s&&s.token_data&&s.token_data?.nft?.commitment!==e(c).token_data?.nft?.commitment&&(p(c,s,!0),e(i)=="STATUS_MINING"&&(await W(),await z())),p(O,Et(e(c).token_data?.nft?.commitment.slice(8,72)),!0)}p(N,a,!0),p(M,Jt(a,!0),!0),p(L,Zt(a,H),!0)};async function At(){if(window.Worker){p(i,"STATUS_IDLE"),r=void 0;const a=await He(()=>import("../chunks/DjknWfVy.js"),[],import.meta.url);n=new a.default,n.onmessage=function(s){const{status:I,message:Q}=s.data;switch(I&&p(i,I,!0),I){case"STATUS_BROADCAST":r=s.data.result,p(x,s.data.hashRate,!0);try{st(r)}catch(et){console.error(et)}p(c,X.getNextBatonUtxo(r),!0),z();break}}}else console.error("no worker")}Fe(async()=>{Va.StorageProvider=Ha,f=k?await ne.named("vox"):await re.named("vox"),m=k?await ne.named("miner"):await re.named("miner"),p(b,Qt(f.mnemonic,f.derivationPath.slice(0,-2),f.isTestnet),!0),p(h,Qt(m.mnemonic,m.derivationPath.slice(0,-2),m.isTestnet),!0);let a=pe(f.getDepositAddress());if(typeof a=="string")throw a;p(u,fe(a.bytecode),!0),y=new Ua(X.USER_AGENT,"1.4.1",j),await y.connect(),y.on("notification",pt),await y.subscribe("blockchain.scripthash.subscribe",V),await y.subscribe("blockchain.scripthash.subscribe",e(u)),await y.subscribe("blockchain.headers.subscribe"),ct(),ot(),At()}),qe(async()=>{n.terminate(),await y.disconnect()});var ht=kn();na("1400jt5",a=>{var s=hn();ce(()=>{ea.title="γ Photons"}),A(a,s)});var mt=T(ht),xt=T(mt,!0),St=_(xt,3);Aa(St,{get template(){return X.template}});var ge=_(St,2);{var Oe=a=>{var s=mn();F(()=>{R(s,"src",xa),R(s,"alt",e(D))}),A(a,s)},Pe=a=>{var s=_n();F(()=>R(s,"src",Sa)),A(a,s)};Z(ge,a=>{e(D)=="CONNECTED"?a(Oe):a(Pe,-1)})}v(mt);var _t=_(mt,4),Ct=T(_t),gt=T(Ct),ve=_(gt,3);v(Ct),v(_t);var Ot=_(_t,2),Bt=T(Ot);{var Te=a=>{var s=gn(),I=dt(s),Q=_(I,2);F(()=>{I.disabled=e(i)=="STATUS_MINING",Q.disabled=e(i)=="STATUS_IDLE"}),lt("click",I,()=>z()),lt("click",Q,()=>W()),A(a,s)};Z(Bt,a=>{e(c)&&a(Te)})}var Dt=_(Bt,2);{var be=a=>{var s=On(),I=T(s);v(s),F(()=>U(I,`${e(x)??""} Hash/s`)),A(a,s)};Z(Dt,a=>{e(x)>0&&a(be)})}var Mt=_(Dt,2),ye=T(Mt,!0);v(Mt),v(Ot);var Rt=_(Ot,2);{var ke=a=>{var s=Pn(),I=_(dt(s),2),Q=T(I),et=T(Q),Ht=_(et,3),Vt=_(Ht,2),Kt=_(Vt);v(Q),v(I);var Pt=_(I,6),Ae=T(Pt,!0);v(Pt);var vt=_(Pt,4),xe=T(vt,!0);v(vt);var Ft=_(vt),qt=_(Ft,2),Xt=_(qt,2),Tt=_(Xt,3),Se=T(Tt);v(Tt);var bt=_(Tt,2),Ce=T(bt,!0);v(bt);var Gt=_(bt,4),jt=T(Gt);ra(jt),It(2),v(Gt),F((yt,Be,De,Me,Re,Le)=>{R(et,"src",Y),R(et,"alt",K),U(Ht,` ${yt??""}
				${K}`),U(Vt,` ${Be??""}
				${$} `),R(Kt,"src",ft),R(Kt,"alt",$),U(Ae,De),U(xe,Me),U(Ft,` Height: ${e(c).height??""} `),U(qt,` Next Payout: ${Re??""}
		${K}`),U(Xt,` Cash: ${Le??""} sats ${$}`),U(Se,`${K} category:`),U(Ce,e(c).token_data?.category)},[()=>(e(L)/100000000n).toLocaleString(),()=>(e(M)/1e8).toLocaleString(),()=>G(X.getNextTarget(e(c),e(d))),()=>Et(e(O)),()=>(Number(BigInt(e(c).token_data?.amount)/420000n)/1e8).toLocaleString(void 0,{maximumFractionDigits:5}),()=>e(c).value.toLocaleString()]),ia(jt,()=>e(l),yt=>p(l,yt)),A(a,s)},Ie=a=>{var s=vn(),I=T(s);v(s),F(()=>U(I,`Mint Chipnet Genesis Tx (0.5 ${$})`)),lt("click",s,()=>it()),A(a,s)},Ee=a=>{var s=Tn(),I=T(s);un(I,{end:17861808e5}),v(s),A(a,s)},Ne=a=>{var s=bn(),I=T(s);La(I),It(2),v(s),A(a,s)};Z(Rt,a=>{e(c)&&e(c).value>0?a(ke):k?Date.now()<17861808e5?a(Ee,2):a(Ne,-1):a(Ie,1)})}var Lt=_(Rt,2);{var we=a=>{var s=yn();lt("click",s,()=>tt()),A(a,s)};Z(Lt,a=>{e(l)&&a(we)})}var Ue=_(Lt,2);sn(Ue),v(ht),F((a,s)=>{U(xt,a),R(gt,"src",Y),R(gt,"alt",K),U(ve,` ${s??""}
			${K}`),U(ye,e(i))},[()=>e(d).toLocaleString(),()=>(e(B)/100000000n).toLocaleString(void 0,{maximumFractionDigits:5})]),A(o,ht),ue()}sa(["click"]);export{Jn as component,Qn as universal};
//# sourceMappingURL=11.krWuhP03.js.map
