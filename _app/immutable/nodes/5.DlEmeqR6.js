import{f as v,a as u,c as H}from"../chunks/yGPdYsEk.js";import"../chunks/Bq1uU4Db.js";import{o as Ot,a as yt}from"../chunks/BL1kRCRP.js";import{as as Pt,p as Et,c,t as y,a as xt,j as o,aa as k,A as z,aq as Tt,s as O,k as S,r as l,f as G}from"../chunks/4Ej_4qXs.js";import{d as It,h as kt,s as wt}from"../chunks/BNpjwQLA.js";import{i as C}from"../chunks/CyUl1IAL.js";import{e as Q,i as K}from"../chunks/PZPIYvej.js";import{b as P,s as g}from"../chunks/CnJGQRAh.js";import{s as Ut}from"../chunks/BP6f-FFp.js";import{i as Dt}from"../chunks/CbXjFJPj.js";import{p as J}from"../chunks/BqgOFi0d.js";import{b as W}from"../chunks/BtgC42a0.js";import{p as V,g as Nt,m as At,o as Bt,j as U,v as Mt,K as Rt,A as St,y as Ct,z as Vt,G as Z,$ as Lt}from"../chunks/zIYK9qkZ.js";import{B as jt,C as qt,D as Xt}from"../chunks/BbIwgq-g.js";const $t=2,tt=(b,s=$t)=>JSON.stringify(b,(n,a)=>{const d=typeof a=="object"&&a!==null?a.constructor.name:typeof a;switch(d){case"Uint8Array":return`<Uint8Array: 0x${V(a)}>`;case"bigint":return`<bigint: ${a.toString()}n>`;case"function":case"symbol":return`<${d}: ${a.toString()}>`;default:return a}},s),Ft=!0,De=Object.freeze(Object.defineProperty({__proto__:null,prerender:Ft},Symbol.toStringTag,{value:"Module"}));var Yt=v("<h3>About Drip Mine</h3> <p>Drip mine is a contract demonstrating the potential of Miner Extractable Value (MEV). Each output of the contract can be spent by anyone, each transaction generates fees that benefit miner that includes the transaction in a block.</p> <p>Bitcoin has always had builtin MEV, in the form of a block subsidy. The block subsidy, or block reward, is a way to create newly minted coins in the first transaction of a block (the coinbase transaction).</p> <p>As the idea of bitcoin continues to develop, on the Bitcoin Cash (BCH) fork, the built-in block subsidy will become less and less important and revenue from including transactions will come to dominate miner revenue.</p> <p>Anyone-can-spend outputs held by the drip-mine covenant by clicking the colorful icons above.</p> <p>When the value of an unspent transaction output locked by the covenant falls below 740 satoshis, all the value is claimed in the next transaction and the output is ‘burned’.</p> <p>Anyone may contribute to the MEV fund by sending outputs to the address below:</p>",1);function Ht(b){var s=Yt();Pt(12),u(b,s)}const zt="https://libauth.org/schemas/wallet-template-v0.schema.json",Gt=`Drip Mine: An MEV faucet
 Contributed by Bitcoin Cash Autist - 2025 
 https://gitlab.com/0353F40E/drip-mine`,Qt="DripMine",Kt={covenant:{description:"Emit MEV as fees to miners.",name:"Drip Mine",scripts:["unlock_return","unlock_burn"]}},Jt={base:{description:"A set of working parameters with a half-life of decay of roughly four years",name:"Base Scenario",transaction:{inputs:[{outpointIndex:0,unlockingBytecode:["slot"],sequenceNumber:1}],outputs:[{lockingBytecode:{script:"lock"}}],locktime:0,version:2},sourceOutputs:[{lockingBytecode:["slot"]}]},return:{description:"Drip value as fee, returning balance to thread.",extends:"base",name:"Drip",transaction:{outputs:[{valueSatoshis:4536}]},sourceOutputs:[{lockingBytecode:["slot"],valueSatoshis:4700}]},burn:{description:"Burn value below threshold as OP_RETURN.",extends:"base",name:"Drip Burn",transaction:{outputs:[{lockingBytecode:{script:"op_return"}}]},sourceOutputs:[{lockingBytecode:["slot"],valueSatoshis:500}]}},Wt={unlock_return:{passes:["return"],name:"Drip MEV",script:"// empty",unlocks:"lock"},unlock_burn:{passes:["burn"],name:"Final MEV Burn",script:"// empty",unlocks:"lock"},op_return:{lockingType:"standard",name:"OP_RETURN",script:"OP_RETURN"},lock:{lockingType:"p2sh32",name:"Drip Mine Covenant",script:`// Drip Mine: An MEV faucet
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
`}},Zt=["BCH_2023_05"],te=0,ee={$schema:zt,description:Gt,name:Qt,entities:Kt,scenarios:Jt,scripts:Wt,supported:Zt,version:te},ne="@unspent/drip",se={name:ne},et=576,w=164,ae=4392,oe=1333036486;class E{static USER_AGENT=se.name;static template=ee;static compiler=Nt(this.template);static getLockingBytecode(s={}){const n=this.compiler.generateBytecode({data:s,scriptId:"lock"});if(!n.success)throw new Error("Failed to generate bytecode, script: , "+tt(n));return n.bytecode}static getScriptHash(s=!0){return At(this.getLockingBytecode(),s)}static getAddress(s="bitcoincash"){return Bt(this.getLockingBytecode(),s)}static getOutput(s){let n=Math.round(s.value*ae/oe)-1;n=n<w?w:n;let a=s.value-n;return s.value>BigInt(et+w)?{lockingBytecode:{compiler:this.compiler,script:"lock"},valueSatoshis:BigInt(a)}:{lockingBytecode:U("6a"),valueSatoshis:BigInt(0)}}static getInput(s){let n=s.value>BigInt(et+w)?"unlock_return":"unlock_burn";return{outpointIndex:s.tx_pos,outpointTransactionHash:U(s.tx_hash),sequenceNumber:1,unlockingBytecode:{compiler:this.compiler,script:n,valueSatoshis:BigInt(s.value)}}}static processOutpoint(s){const n=[],a=[];a.push(this.getOutput(s)),n.push(this.getInput(s));const d=Mt({locktime:0,version:2,inputs:n,outputs:a});if(!d.success)throw new Error("generate transaction failed!, errors: "+tt(d.errors));return V(Rt(d.transaction))}}const ie="data:image/svg+xml,%3csvg%20style='height:400px;width:400px'%20version='1.1'%20viewBox='0%200%2016%2016'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%3e%3cdefs%3e%3cradialGradient%20id='a'%20cx='7.24'%20cy='7.07'%20r='3.73'%20gradientTransform='matrix(-.551%201.72%20-1.8%20-.576%2022.2%20-.713)'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%23b7ffff'%20stop-opacity='.839'%20offset='.05'/%3e%3cstop%20stop-color='%230052ef'%20offset='.95'/%3e%3c/radialGradient%3e%3c/defs%3e%3cpath%20d='m8.28%203.09c0.21-0.784%203.87%202.13%203.87%205.16%200%201.99-1.34%203.52-3.57%203.51-2.44%200-3.9-1.33-3.9-3.23%200-2.05%202.88-2.74%203.6-5.44z'%20fill='url(%23a)'/%3e%3c/svg%3e";var re=v('<meta name="description" content="Release the miner extractable value (MEV)!"/>'),ce=v("<img/>"),le=v('<img alt="Disconnected"/>'),ue=(b,s)=>s(),pe=v('<div class="row svelte-1w1ojhb"><button class="svelte-1w1ojhb"><img/></button></div>'),he=v("<p>No spendable outputs, check back in 10 minutes.</p>"),de=v('<div class="row svelte-1w1ojhb"><button disabled class="svelte-1w1ojhb"><img/></button></div>'),me=v("<p>No pending transactions</p>"),_e=v('<section class="svelte-1w1ojhb"><div class="status svelte-1w1ojhb"><!> <!></div> <h1>Release the miner extractable value (MEV)!</h1> <div class="header svelte-1w1ojhb"><button class="svelte-1w1ojhb">Release all Miner Extractable Value (MEV)</button></div> <h3>Unspent Transaction Outputs (utxos)</h3> <div class="grid svelte-1w1ojhb"><!></div> <h3>Mempool Transactions</h3> <div class="grid svelte-1w1ojhb"><!></div> <!> <qr-code><img slot="icon"/></qr-code> <pre id="deposit"> </pre></section>',2);function Ne(b,s){Et(s,!1);let n=z([]),a,x="";x=E.getScriptHash();let d="",T=z(""),D=new Set,L,j=J.url.hostname=="vox.cash"?"bitcoincash":"bchtest",nt=J.url.hostname=="vox.cash"?"bch.imaginary.cash":"chipnet.bch.ninja";const st=()=>{clearTimeout(L),L=setTimeout(()=>{D=new Set},1e4)},at=function(t){t.method==="blockchain.scripthash.subscribe"?t.params[1]!==d&&(d=t.params[1],k(T,Z[a.status]),X()):console.log(t)},ot=async function(t){let e=await a.request("blockchain.transaction.broadcast",t);if(e instanceof Error)throw k(T,Z[a.status]),e},it=function(){o(n).filter(t=>t.height>0).map((t,e)=>{q(t,e)})},q=async function(t,e){let h=E.processOutpoint(t),i=St(U(h));if(typeof i=="string")throw i;D.add(`${t.tx_hash}":"${t.tx_pos}`),st();let m=Ct(V(Vt(U(h)))),_=Number(i.outputs[0].valueSatoshis);o(n).splice(e,1);let f=o(n).filter(r=>r.height>0||r.value<_?!0:r.value==_&&r.tx_hash<m).length;o(n).splice(f,0,{height:0,tx_hash:m,value:_}),k(n,o(n)),await ot(h)},X=async function(){let t=await a.request("blockchain.scripthash.listunspent",x,"exclude_tokens");if(t instanceof Error)throw t;let e=new Set(t.map(h=>`${h.tx_hash}":"${h.tx_pos}`));(o(n).length==0||D.intersection(e).size==0)&&k(n,t)};Ot(async()=>{a=new Lt(E.USER_AGENT,"1.4.1",nt),await a.connect(),a.on("notification",at),await a.subscribe("blockchain.scripthash.subscribe",x),X()}),yt(async()=>{await a.disconnect()}),Dt();var N=_e();kt(t=>{var e=re();Tt.title="Drip Mine",u(t,e)});var A=c(N),$=c(A);jt($,{get template(){return E.template}});var rt=O($,2);{var ct=t=>{var e=ce();y(()=>{g(e,"src",qt),g(e,"alt",o(T))}),u(t,e)},lt=t=>{var e=le();y(()=>g(e,"src",Xt)),u(t,e)};C(rt,t=>{o(T)=="CONNECTED"?t(ct):t(lt,!1)})}l(A);var B=O(A,4),ut=c(B);ut.__click=[ue,it],l(B);var M=O(B,4),pt=c(M);{var ht=t=>{var e=H(),h=G(e);Q(h,1,()=>o(n).filter(i=>i.height>0),K,(i,m,_)=>{var f=pe(),r=c(f);r.__click=()=>q(o(m),_);var I=c(r);l(r),l(f),y(bt=>{g(I,"src",bt),g(I,"alt",o(m).tx_hash)},[()=>W(`0x${o(m).tx_hash}`,32)],S),u(i,f)}),u(t,e)},dt=t=>{var e=he();u(t,e)};C(pt,t=>{o(n).filter(e=>e.height>0).length>0?t(ht):t(dt,!1)})}l(M);var R=O(M,4),mt=c(R);{var _t=t=>{var e=H(),h=G(e);Q(h,1,()=>o(n).filter(i=>i.height<=0),K,(i,m)=>{var _=de(),f=c(_),r=c(f);l(f),l(_),y(I=>{g(r,"src",I),g(r,"alt",o(m).tx_hash)},[()=>W(`0x${o(m).tx_hash}`,32)],S),u(i,_)}),u(t,e)},vt=t=>{var e=me();u(t,e)};C(mt,t=>{o(n).filter(e=>e.height<=0).length>0?t(_t):t(vt,!1)})}l(R);var F=O(R,2);Ht(F);var p=O(F,2);P(p,"id","qr1"),y(()=>P(p,"contents",E.getAddress(j))),P(p,"module-color","#000"),P(p,"position-ring-color","#0052ef"),P(p,"position-center-color","#b7ffff"),P(p,"mask-x-to-y-ratio","1.2"),Ut(p,`width: 150px;
									height: 150px;
									margin: 0.5em auto;
									background-color: #fff;`);var ft=c(p);l(p);var Y=O(p,2),gt=c(Y,!0);l(Y),l(N),y(t=>{g(ft,"src",ie),wt(gt,t)},[()=>E.getAddress(j)],S),u(b,N),xt()}It(["click"]);export{Ne as component,De as universal};
//# sourceMappingURL=5.DlEmeqR6.js.map
