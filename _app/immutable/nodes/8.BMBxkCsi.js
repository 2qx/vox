import{f as p,a as c,c as Z}from"../chunks/DTc5U4eY.js";import"../chunks/CuzQ0eOn.js";import{o as Tt,a as It}from"../chunks/_R59KZhj.js";import{aA as kt,p as wt,t as x,a as Ut,ay as Nt,c as l,s as _,J as q,I as a,v as tt,r as u,ak as B,f as F}from"../chunks/CQU5mOuk.js";import{d as Dt,h as At,s as Bt}from"../chunks/CF3aPdyL.js";import{i as M}from"../chunks/CZ0rTjPC.js";import{e as et,i as nt}from"../chunks/CbL2L94E.js";import{a as y,s as m}from"../chunks/-rOGAMhN.js";import{s as Mt}from"../chunks/BfYLLTK_.js";import{i as Rt}from"../chunks/DiAzQF1U.js";import{p as st}from"../chunks/BtG5M0Gx.js";import{b as at}from"../chunks/B8sppVjI.js";import{$ as Ct,a as it}from"../chunks/BDt1pbpk.js";import{g as Vt,d as St,e as jt,h as C,f as Lt,b as ct,x as Xt,y as qt,z as Ft,A as Yt}from"../chunks/BQUio51k.js";import{s as ot}from"../chunks/BCTix_QU.js";import{C as Ht}from"../chunks/B7hCbxZp.js";import{D as $t}from"../chunks/DMvn4Q5j.js";import{B as zt}from"../chunks/BzLj6JBc.js";const Gt=!0,Le=Object.freeze(Object.defineProperty({__proto__:null,prerender:Gt},Symbol.toStringTag,{value:"Module"}));var Qt=p("<h3>About Drip Mine</h3> <p>Drip mine is a contract demonstrating the potential of Miner Extractable Value (MEV). Each output of the contract can be spent by anyone, each transaction generates fees that benefit miner that includes the transaction in a block.</p> <p>Bitcoin has always had builtin MEV, in the form of a block subsidy. The block subsidy, or block reward, is a way to create newly minted coins in the first transaction of a block (the coinbase transaction).</p> <p>As the idea of bitcoin continues to develop, on the Bitcoin Cash (BCH) fork, the built-in block subsidy will become less and less important and revenue from including transactions will come to dominate miner revenue.</p> <p>Anyone-can-spend outputs held by the drip-mine covenant by clicking the colorful icons above.</p> <p>When the value of an unspent transaction output locked by the covenant falls below 740 satoshis, all the value is claimed in the next transaction and the output is ‘burned’.</p> <p>Anyone may contribute to the MEV fund by sending outputs to the address below:</p>",1);function Kt(I){var n=Qt();kt(12),c(I,n)}const Jt="https://libauth.org/schemas/wallet-template-v0.schema.json",Wt=`Drip Mine: An MEV faucet
 Contributed by Bitcoin Cash Autist - 2025 
 https://gitlab.com/0353F40E/drip-mine`,Zt="DripMine",te={covenant:{description:"Emit MEV as fees to miners.",name:"Drip Mine",scripts:["unlock_return","unlock_burn"]}},ee={base:{description:"A set of working parameters with a half-life of decay of roughly four years",name:"Base Scenario",transaction:{inputs:[{outpointIndex:0,unlockingBytecode:["slot"],sequenceNumber:1}],outputs:[{lockingBytecode:{script:"lock"}}],locktime:0,version:2},sourceOutputs:[{lockingBytecode:["slot"]}]},return:{description:"Drip value as fee, returning balance to thread.",extends:"base",name:"Drip",transaction:{outputs:[{valueSatoshis:4536}]},sourceOutputs:[{lockingBytecode:["slot"],valueSatoshis:4700}]},burn:{description:"Burn value below threshold as OP_RETURN.",extends:"base",name:"Drip Burn",transaction:{outputs:[{lockingBytecode:{script:"op_return"}}]},sourceOutputs:[{lockingBytecode:["slot"],valueSatoshis:500}]}},ne={unlock_return:{passes:["return"],name:"Drip MEV",script:"// empty",unlocks:"lock"},unlock_burn:{passes:["burn"],name:"Final MEV Burn",script:"// empty",unlocks:"lock"},op_return:{lockingType:"standard",name:"OP_RETURN",script:"OP_RETURN"},lock:{lockingType:"p2sh32",name:"Drip Mine Covenant",script:`// Drip Mine: An MEV faucet
// Contributed by Bitcoin Cash Autist - 2025
// https://gitlab.com/0353F40E/drip-mine
// 
// contract DripMine() {

    // function drip() {
        // Drip once per block
        OP_1 OP_CHECKSEQUENCEVERIFY OP_DROP
        // require(tx.age >= 1);

        // Drip will be released as TX fee
        OP_TXINPUTCOUNT OP_1 OP_NUMEQUALVERIFY
        OP_TXOUTPUTCOUNT OP_1 OP_NUMEQUALVERIFY
        // require(tx.inputs.length == 1);
        // require(tx.outputs.length == 1);

        // dustLimit = 444 + output_size * 3; // p2sh32 output size is 44
        <576> 
        // int dustLimit = 576;

        // minPayout = this_tx_size * min_fee_rate; 
        // this TX size will be 164, double check when compiling
        <164>
        // int minPayout = 164;

        // if we have enough to pay out the minimum and stay above dust limit
        // then we drip from the contract
        OP_INPUTINDEX OP_UTXOVALUE OP_ROT OP_2 OP_PICK OP_ADD OP_GREATERTHAN OP_IF
        // if (tx.inputs[this.activeInputIndex].value > dustLimit + minPayout) {

            // DripMine contract must be passed on
            OP_INPUTINDEX OP_UTXOBYTECODE OP_INPUTINDEX OP_OUTPUTBYTECODE OP_EQUALVERIFY
            // require(tx.inputs[this.activeInputIndex].lockingBytecode ==
            //         tx.outputs[this.activeInputIndex].lockingBytecode);

            // Calculate maxPayout
            // Decay half-life of 4 years
            OP_INPUTINDEX OP_UTXOVALUE <4392> OP_MUL <1333036486> OP_DIV
            // int maxPayout = (tx.inputs[this.activeInputIndex].value * 4392) / 1333036486;

            // If calculated payout would be too low, switch to flat minPayout
            OP_2DUP OP_GREATERTHAN OP_IF
            // if (maxPayout < minPayout) {
                OP_OVER OP_NIP
                // maxPayout = minPayout;
            // } 
            OP_ENDIF

            // TX fee is the payout to miners
            OP_INPUTINDEX OP_UTXOVALUE OP_INPUTINDEX OP_OUTPUTVALUE OP_SUB
            // int payout = tx.inputs[this.activeInputIndex].value -
            //              tx.outputs[this.activeInputIndex].value;
            OP_2DUP OP_GREATERTHANOREQUAL OP_VERIFY
            // require(payout <= maxPayout);

        // else we sweep everything as fee and terminate the contract
        OP_2DROP OP_ELSE
        // } else {
            // Burn the output with remaining value to miners' fees
            OP_INPUTINDEX OP_OUTPUTVALUE OP_0 OP_NUMEQUALVERIFY
            // require(tx.outputs[this.activeInputIndex].value == 0);
            OP_INPUTINDEX OP_OUTPUTBYTECODE <0x6a> OP_EQUALVERIFY
            // require(tx.outputs[this.activeInputIndex].lockingBytecode == 0x6a);
        // } 
        OP_ENDIF 
    // } 
    OP_DROP OP_1
// }
`}},se=["BCH_2023_05"],ae=0,ie={$schema:Jt,description:Wt,name:Zt,entities:te,scenarios:ee,scripts:ne,supported:se,version:ae},oe="@unspent/drip",re={name:oe},rt=576,R=164,ce=4392,le=1333036486;class T{static USER_AGENT=re.name;static template=ie;static compiler=Vt(this.template);static getLockingBytecode(n={}){const e=this.compiler.generateBytecode({data:n,scriptId:"lock"});if(!e.success)throw new Error("Failed to generate bytecode, script: , "+ot(e));return e.bytecode}static getScriptHash(n=!0){return St(this.getLockingBytecode(),n)}static getAddress(n="bitcoincash"){return jt(this.getLockingBytecode(),n)}static getOutput(n){let e=Math.round(n.value*ce/le)-1;e=e<R?R:e;let i=n.value-e;return n.value>BigInt(rt+R)?{lockingBytecode:{compiler:this.compiler,script:"lock"},valueSatoshis:BigInt(i)}:{lockingBytecode:C("6a"),valueSatoshis:BigInt(0)}}static getInput(n){let e=n.value>BigInt(rt+R)?"unlock_return":"unlock_burn";return{outpointIndex:n.tx_pos,outpointTransactionHash:C(n.tx_hash),sequenceNumber:1,unlockingBytecode:{compiler:this.compiler,script:e,valueSatoshis:BigInt(n.value)}}}static processOutpoint(n){const e=[],i=[];i.push(this.getOutput(n)),e.push(this.getInput(n));const f=Lt({locktime:0,version:2,inputs:e,outputs:i});if(!f.success)throw new Error("generate transaction failed!, errors: "+ot(f.errors));return ct(Xt(f.transaction))}}const ue="data:image/svg+xml,%3csvg%20style='height:400px;width:400px'%20version='1.1'%20viewBox='0%200%2016%2016'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%3e%3cdefs%3e%3cradialGradient%20id='a'%20cx='7.24'%20cy='7.07'%20r='3.73'%20gradientTransform='matrix(-.551%201.72%20-1.8%20-.576%2022.2%20-.713)'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%23b7ffff'%20stop-opacity='.839'%20offset='.05'/%3e%3cstop%20stop-color='%230052ef'%20offset='.95'/%3e%3c/radialGradient%3e%3c/defs%3e%3cpath%20d='m8.28%203.09c0.21-0.784%203.87%202.13%203.87%205.16%200%201.99-1.34%203.52-3.57%203.51-2.44%200-3.9-1.33-3.9-3.23%200-2.05%202.88-2.74%203.6-5.44z'%20fill='url(%23a)'/%3e%3c/svg%3e";var pe=p('<meta name="description" content="Release miner extractable value (MEV)!"/>'),de=p("<img/>"),he=p('<img alt="Disconnected"/>'),me=(I,n)=>n(),ve=p('<div class="row svelte-1jxmddj"><button class="svelte-1jxmddj"><img/></button></div>'),_e=p("<p>No spendable outputs, check back in 10 minutes.</p>"),fe=p('<div class="row svelte-1jxmddj"><button disabled class="svelte-1jxmddj"><img/></button></div>'),ge=p("<p>No pending transactions</p>"),be=p('<div class="header svelte-1jxmddj"><button class="svelte-1jxmddj">Release all Miner Extractable Value (MEV)</button></div> <h3>Unspent Transaction Outputs (utxos)</h3> <div class="grid svelte-1jxmddj"><!></div> <h3>Mempool Transactions</h3> <div class="grid svelte-1jxmddj"><!></div>',1),Oe=p('<div class="swap svelte-1jxmddj"><p>Not connected?</p></div>'),Ee=p('<section class="svelte-1jxmddj"><div class="status svelte-1jxmddj"><!> <!></div> <h1>Release miner extractable value (MEV)</h1> <!> <!> <qr-code><img width="50px" slot="icon" alt="drip MEV icon"/></qr-code> <pre id="deposit"> </pre></section>',2);function Xe(I,n){wt(n,!1);let e=tt([]),i,D="";D=T.getScriptHash();let f="",k=tt(""),V=new Set,Y,H=st.url.hostname=="vox.cash"?"bitcoincash":"bchtest",lt=st.url.hostname=="vox.cash"?"bch.imaginary.cash":"chipnet.bch.ninja";const ut=()=>{clearTimeout(Y),Y=setTimeout(()=>{V=new Set},1e4)},pt=function(t){t.method==="blockchain.scripthash.subscribe"?t.params[1]!==f&&(f=t.params[1],B(k,it[i.status]),z()):console.log(t)},dt=async function(t){let s=await i.request("blockchain.transaction.broadcast",t);if(s instanceof Error)throw B(k,it[i.status]),s},ht=function(){a(e).filter(t=>t.height>0).map((t,s)=>{$(t,s)})},$=async function(t,s){let h=T.processOutpoint(t),w=qt(C(h));if(typeof w=="string")throw w;V.add(`${t.tx_hash}":"${t.tx_pos}`),ut();let g=Ft(ct(Yt(C(h)))),U=Number(w.outputs[0].valueSatoshis);a(e).splice(s,1);let L=a(e).filter(b=>b.height>0||b.value<U?!0:b.value==U&&b.tx_hash<g).length;a(e).splice(L,0,{height:0,tx_hash:g,value:U}),B(e,a(e)),await dt(h)},z=async function(){let t=await i.request("blockchain.scripthash.listunspent",D,"exclude_tokens");if(t instanceof Error)throw t;let s=new Set(t.map(h=>`${h.tx_hash}":"${h.tx_pos}`));(a(e).length==0||V.intersection(s).size==0)&&B(e,t)};Tt(async()=>{i=new Ct(T.USER_AGENT,"1.4.1",lt),await i.connect(),i.on("notification",pt),await i.subscribe("blockchain.scripthash.subscribe",D),z()}),It(async()=>{await i.disconnect()}),Rt();var S=Ee();At(t=>{var s=pe();Nt.title="💧 Drip Mine",c(t,s)});var j=l(S),G=l(j);zt(G,{get template(){return T.template}});var mt=_(G,2);{var vt=t=>{var s=de();x(()=>{m(s,"src",Ht),m(s,"alt",a(k))}),c(t,s)},_t=t=>{var s=he();x(()=>m(s,"src",$t)),c(t,s)};M(mt,t=>{a(k)=="CONNECTED"?t(vt):t(_t,!1)})}u(j);var Q=_(j,4);{var ft=t=>{var s=be(),h=F(s),w=l(h);w.__click=[me,ht],u(h);var g=_(h,4),U=l(g);{var L=o=>{var r=Z(),X=F(r);et(X,1,()=>a(e).filter(v=>v.height>0).slice(0,45),nt,(v,O,N)=>{var E=ve(),P=l(E);P.__click=()=>$(a(O),N);var A=l(P);u(P),u(E),x(yt=>{m(A,"src",yt),m(A,"alt",a(O).tx_hash)},[()=>at(`0x${a(O).tx_hash}`,32)],q),c(v,E)}),c(o,r)},b=o=>{var r=_e();c(o,r)};M(U,o=>{a(e).filter(r=>r.height>0).length>0?o(L):o(b,!1)})}u(g);var W=_(g,4),Et=l(W);{var Pt=o=>{var r=Z(),X=F(r);et(X,1,()=>a(e).filter(v=>v.height<=0),nt,(v,O)=>{var N=fe(),E=l(N),P=l(E);u(E),u(N),x(A=>{m(P,"src",A),m(P,"alt",a(O).tx_hash)},[()=>at(`0x${a(O).tx_hash}`,32)],q),c(v,N)}),c(o,r)},xt=o=>{var r=ge();c(o,r)};M(Et,o=>{a(e).filter(r=>r.height<=0).length>0?o(Pt):o(xt,!1)})}u(W),c(t,s)},gt=t=>{var s=Oe();c(t,s)};M(Q,t=>{a(k)=="CONNECTED"?t(ft):t(gt,!1)})}var K=_(Q,2);Kt(K);var d=_(K,2);y(d,"id","qr1"),x(()=>y(d,"contents",T.getAddress(H))),y(d,"module-color","#000"),y(d,"position-ring-color","#0052ef"),y(d,"position-center-color","#b7ffff"),y(d,"mask-x-to-y-ratio","1.2"),Mt(d,`width: 150px;
									height: 150px;
									margin: 0.5em auto;
									background-color: #fff;`);var bt=l(d);u(d);var J=_(d,2),Ot=l(J,!0);u(J),u(S),x(t=>{m(bt,"src",ue),Bt(Ot,t)},[()=>T.getAddress(H)],q),c(I,S),Ut()}Dt(["click"]);export{Xe as component,Le as universal};
//# sourceMappingURL=8.BMBxkCsi.js.map
