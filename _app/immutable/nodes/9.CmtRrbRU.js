import{f as u,a as r,c as W}from"../chunks/BQ8W2y5r.js";import"../chunks/Bx2aHIrS.js";import{o as wt,a as Ut}from"../chunks/Bd70tTqc.js";import{aI as Nt,p as Dt,t as y,a as Bt,m as At,c,s as _,aG as Mt,w as a,L as Z,r as l,ap as A,f as F,ac as tt}from"../chunks/5yJvB4cG.js";import{s as Rt}from"../chunks/BRwHQdvm.js";import{i as M}from"../chunks/C92i--r8.js";import{e as et,i as nt}from"../chunks/C5HSheMB.js";import{h as Ct}from"../chunks/0UgjxnON.js";import{c as x,a as Vt,s as m}from"../chunks/BGVSAru1.js";import{d as St,b as st}from"../chunks/DaYQnPgE.js";import{i as Lt}from"../chunks/DYzbknER.js";import{p as at}from"../chunks/CS2zJVke.js";import{b as it}from"../chunks/B8sppVjI.js";import{e as Xt,C as ot}from"../chunks/hh7Yrpmc.js";import{i as qt,k as Ft,l as Yt,h as C,m as Ht,b as lt,I as Gt,J as zt,K as Qt,L as jt}from"../chunks/D6NMCXg_.js";import{s as rt}from"../chunks/VY1jMpio.js";import{C as Kt}from"../chunks/B7hCbxZp.js";import{D as $t}from"../chunks/DMvn4Q5j.js";import{B as Jt}from"../chunks/Cnk_cigO.js";const Wt=!0,He=Object.freeze(Object.defineProperty({__proto__:null,prerender:Wt},Symbol.toStringTag,{value:"Module"}));var Zt=u("<h3>About Drip Mine</h3> <p>Drip mine is a contract demonstrating the potential of Miner Extractable Value (MEV). Each output of the contract can be spent by anyone, each transaction generates fees that benefit miner that includes the transaction in a block.</p> <p>Bitcoin has always had builtin MEV, in the form of a block subsidy. The block subsidy, or block reward, is a way to create newly minted coins in the first transaction of a block (the coinbase transaction).</p> <p>As the idea of bitcoin continues to develop, on the Bitcoin Cash (BCH) fork, the built-in block subsidy will become less and less important and revenue from including transactions will come to dominate miner revenue.</p> <p>Anyone-can-spend outputs held by the drip-mine covenant by clicking the colorful icons above.</p> <p>When the value of an unspent transaction output locked by the covenant falls below 740 satoshis, all the value is claimed in the next transaction and the output is ‘burned’.</p> <p>Anyone may contribute to the MEV fund by sending outputs to the address below:</p>",1);function te(N){var s=Zt();Nt(12),r(N,s)}const ee="https://libauth.org/schemas/wallet-template-v0.schema.json",ne=`Drip Mine: An MEV faucet
 Contributed by Bitcoin Cash Autist - 2025 
 https://gitlab.com/0353F40E/drip-mine`,se="DripMine",ae={covenant:{description:"Emit MEV as fees to miners.",name:"Drip Mine",scripts:["unlock_return","unlock_burn"]}},ie={base:{description:"A set of working parameters with a half-life of decay of roughly four years",name:"Base Scenario",transaction:{inputs:[{outpointIndex:0,unlockingBytecode:["slot"],sequenceNumber:1}],outputs:[{lockingBytecode:{script:"lock"}}],locktime:0,version:2},sourceOutputs:[{lockingBytecode:["slot"]}]},return:{description:"Drip value as fee, returning balance to thread.",extends:"base",name:"Drip",transaction:{outputs:[{valueSatoshis:4536}]},sourceOutputs:[{lockingBytecode:["slot"],valueSatoshis:4700}]},burn:{description:"Burn value below threshold as OP_RETURN.",extends:"base",name:"Drip Burn",transaction:{outputs:[{lockingBytecode:{script:"op_return"}}]},sourceOutputs:[{lockingBytecode:["slot"],valueSatoshis:500}]}},oe={unlock_return:{passes:["return"],name:"Drip MEV",script:"// empty",unlocks:"lock"},unlock_burn:{passes:["burn"],name:"Final MEV Burn",script:"// empty",unlocks:"lock"},op_return:{lockingType:"standard",name:"OP_RETURN",script:"OP_RETURN"},lock:{lockingType:"p2sh32",name:"Drip Mine Covenant",script:`// Drip Mine: An MEV faucet
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
`}},re=["BCH_2023_05"],ce=0,le={$schema:ee,description:ne,name:se,entities:ae,scenarios:ie,scripts:oe,supported:re,version:ce},ue="@unspent/drip",pe={name:ue},ct=576,R=164,he=4392,de=1333036486;class I{static USER_AGENT=pe.name;static template=le;static compiler=qt(this.template);static getLockingBytecode(s={}){const e=this.compiler.generateBytecode({data:s,scriptId:"lock"});if(!e.success)throw new Error("Failed to generate bytecode, script: , "+rt(e));return e.bytecode}static getScriptHash(s=!0){return Ft(this.getLockingBytecode(),s)}static getAddress(s="bitcoincash"){return Yt(this.getLockingBytecode(),s)}static getOutput(s){let e=Math.round(s.value*he/de)-1;e=e<R?R:e;let o=s.value-e;return s.value>BigInt(ct+R)?{lockingBytecode:{compiler:this.compiler,script:"lock"},valueSatoshis:BigInt(o)}:{lockingBytecode:C("6a"),valueSatoshis:BigInt(0)}}static getInput(s){let e=s.value>BigInt(ct+R)?"unlock_return":"unlock_burn";return{outpointIndex:s.tx_pos,outpointTransactionHash:C(s.tx_hash),sequenceNumber:1,unlockingBytecode:{compiler:this.compiler,script:e,valueSatoshis:BigInt(s.value)}}}static processOutpoint(s){const e=[],o=[];o.push(this.getOutput(s)),e.push(this.getInput(s));const f=Ht({locktime:0,version:2,inputs:e,outputs:o});if(!f.success)throw new Error("generate transaction failed!, errors: "+rt(f.errors));return lt(Gt(f.transaction))}}const me="data:image/svg+xml,%3csvg%20style='height:400px;width:400px'%20version='1.1'%20viewBox='0%200%2016%2016'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%3e%3cdefs%3e%3cradialGradient%20id='a'%20cx='7.24'%20cy='7.07'%20r='3.73'%20gradientTransform='matrix(-.551%201.72%20-1.8%20-.576%2022.2%20-.713)'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%23b7ffff'%20stop-opacity='.839'%20offset='.05'/%3e%3cstop%20stop-color='%230052ef'%20offset='.95'/%3e%3c/radialGradient%3e%3c/defs%3e%3cpath%20d='m8.28%203.09c0.21-0.784%203.87%202.13%203.87%205.16%200%201.99-1.34%203.52-3.57%203.51-2.44%200-3.9-1.33-3.9-3.23%200-2.05%202.88-2.74%203.6-5.44z'%20fill='url(%23a)'/%3e%3c/svg%3e";var ve=u('<meta name="description" content="Release miner extractable value (MEV)!"/>'),_e=u("<img/>"),fe=u('<img alt="Disconnected"/>'),ge=u('<div class="row svelte-8n7es0"><button class="svelte-8n7es0"><img/></button></div>'),be=u("<p>No spendable outputs, check back in 10 minutes.</p>"),Oe=u('<div class="row svelte-8n7es0"><button disabled="" class="svelte-8n7es0"><img/></button></div>'),Ee=u("<p>No pending transactions</p>"),Pe=u('<div class="header svelte-8n7es0"><button class="svelte-8n7es0">Release all Miner Extractable Value (MEV)</button></div> <h3>Unspent Transaction Outputs (utxos)</h3> <div class="grid svelte-8n7es0"><!></div> <h3>Mempool Transactions</h3> <div class="grid svelte-8n7es0"><!></div>',1),ye=u('<div class="swap svelte-8n7es0"><p>Not connected?</p></div>'),xe=u('<section class="svelte-8n7es0"><div class="status svelte-8n7es0"><!> <!></div> <h1>Release miner extractable value (MEV)</h1> <!> <!> <qr-code><img width="50px" slot="icon" alt="drip MEV icon"/></qr-code> <pre id="deposit"> </pre></section>',2);function Ge(N,s){Dt(s,!1);let e=Z([]),o,D="";D=I.getScriptHash();let f="",T=Z(""),V=new Set,Y,H=at.url.hostname=="vox.cash"?"bitcoincash":"bchtest",ut=at.url.hostname=="vox.cash"?"bch.imaginary.cash":"chipnet.bch.ninja";const pt=()=>{clearTimeout(Y),Y=setTimeout(()=>{V=new Set},1e4)},ht=function(t){t.method==="blockchain.scripthash.subscribe"?t.params[1]!==f&&(f=t.params[1],A(T,ot[o.status]),z()):console.log(t)},dt=async function(t){let n=await o.request("blockchain.transaction.broadcast",t);if(n instanceof Error)throw A(T,ot[o.status]),n},mt=function(){a(e).filter(t=>t.height>0).map((t,n)=>{G(t,n)})},G=async function(t,n){let h=I.processOutpoint(t),k=zt(C(h));if(typeof k=="string")throw k;V.add(`${t.tx_hash}":"${t.tx_pos}`),pt();let g=Qt(lt(jt(C(h)))),w=Number(k.outputs[0].valueSatoshis);a(e).splice(n,1);let X=a(e).filter(b=>b.height>0||b.value<w?!0:b.value==w&&b.tx_hash<g).length;a(e).splice(X,0,{height:0,tx_hash:g,value:w}),A(e,a(e)),await dt(h)},z=async function(){let t=await o.request("blockchain.scripthash.listunspent",D,"exclude_tokens");if(t instanceof Error)throw t;let n=new Set(t.map(h=>`${h.tx_hash}":"${h.tx_pos}`));(a(e).length==0||V.intersection(n).size==0)&&A(e,t)};wt(async()=>{o=new Xt(I.USER_AGENT,"1.4.1",ut),await o.connect(),o.on("notification",ht),await o.subscribe("blockchain.scripthash.subscribe",D),z()}),Ut(async()=>{await o.disconnect()}),Lt();var S=xe();Ct("8n7es0",t=>{var n=ve();At(()=>{Mt.title="💧 Drip Mine"}),r(t,n)});var L=c(S),Q=c(L);Jt(Q,{get template(){return I.template}});var vt=_(Q,2);{var _t=t=>{var n=_e();y(()=>{m(n,"src",Kt),m(n,"alt",a(T))}),r(t,n)},ft=t=>{var n=fe();y(()=>m(n,"src",$t)),r(t,n)};M(vt,t=>{a(T)=="CONNECTED"?t(_t):t(ft,-1)})}l(L);var j=_(L,4);{var gt=t=>{var n=Pe(),h=F(n),k=c(h);l(h);var g=_(h,4),w=c(g);{var X=i=>{var d=W(),q=F(d);et(q,1,()=>a(e).filter(v=>v.height>0).slice(0,45),nt,(v,O,U)=>{var E=ge(),P=c(E),B=c(P);l(P),l(E),y(kt=>{m(B,"src",kt),m(B,"alt",a(O).tx_hash)},[()=>it(`0x${a(O).tx_hash}`,32)]),st("click",P,()=>G(a(O),U)),r(v,E)}),r(i,d)},b=tt(()=>a(e).filter(i=>i.height>0).length>0),Pt=i=>{var d=be();r(i,d)};M(w,i=>{a(b)?i(X):i(Pt,-1)})}l(g);var J=_(g,4),yt=c(J);{var xt=i=>{var d=W(),q=F(d);et(q,1,()=>a(e).filter(v=>v.height<=0),nt,(v,O)=>{var U=Oe(),E=c(U),P=c(E);l(E),l(U),y(B=>{m(P,"src",B),m(P,"alt",a(O).tx_hash)},[()=>it(`0x${a(O).tx_hash}`,32)]),r(v,U)}),r(i,d)},It=tt(()=>a(e).filter(i=>i.height<=0).length>0),Tt=i=>{var d=Ee();r(i,d)};M(yt,i=>{a(It)?i(xt):i(Tt,-1)})}l(J),st("click",k,()=>mt()),r(t,n)},bt=t=>{var n=ye();r(t,n)};M(j,t=>{a(T)=="CONNECTED"?t(gt):t(bt,-1)})}var K=_(j,2);te(K);var p=_(K,2);x(p,"id","qr1"),y(()=>x(p,"contents",I.getAddress(H))),x(p,"module-color","#000"),x(p,"position-ring-color","#0052ef"),x(p,"position-center-color","#b7ffff"),x(p,"mask-x-to-y-ratio","1.2"),Vt(p,`width: 150px;
									height: 150px;
									margin: 0.5em auto;
									background-color: #fff;`);var Ot=c(p);l(p);var $=_(p,2),Et=c($,!0);l($),l(S),y(t=>{m(Ot,"src",me),Rt(Et,t)},[()=>I.getAddress(H)]),r(N,S),Bt()}St(["click"]);export{Ge as component,He as universal};
//# sourceMappingURL=9.CmtRrbRU.js.map
