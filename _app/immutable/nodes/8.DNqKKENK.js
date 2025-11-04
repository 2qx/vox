import{f as _,a as u,d as H}from"../chunks/DYbKDSXk.js";import"../chunks/vmZ8CxnS.js";import{o as Ot,a as Et}from"../chunks/CPLxGhQo.js";import{au as Pt,p as yt,c,t as O,a as xt,E as a,ad as k,n as $,as as Tt,s as b,F as C,r as l,f as z}from"../chunks/DlUVEpaU.js";import{d as It,h as kt,s as wt}from"../chunks/DIwOIcma.js";import{i as V}from"../chunks/C6jlbT71.js";import{e as G,i as Q}from"../chunks/CMKxWac-.js";import{b as E,s as f}from"../chunks/vpaS6ag4.js";import{s as Ut}from"../chunks/BPbJ7-kK.js";import{i as Dt}from"../chunks/B9oCwaFp.js";import{p as K}from"../chunks/C1QV6duk.js";import{b as W}from"../chunks/B8sppVjI.js";import{a as J,$ as Nt}from"../chunks/CRbVXWIV.js";import{k as Bt,m as At,o as Mt,l as U,b as et,x as Rt,y as Ct,z as Vt,A as St}from"../chunks/DLngWCRZ.js";import{s as Z}from"../chunks/yjHrmcRe.js";import{g as Lt}from"../chunks/4WAd-rdk.js";import{C as Xt}from"../chunks/B7hCbxZp.js";import{B as qt,D as Ft}from"../chunks/DpKBRRcz.js";const jt=!0,Ae=Object.freeze(Object.defineProperty({__proto__:null,prerender:jt},Symbol.toStringTag,{value:"Module"}));var Yt=_("<h3>About Drip Mine</h3> <p>Drip mine is a contract demonstrating the potential of Miner Extractable Value (MEV). Each output of the contract can be spent by anyone, each transaction generates fees that benefit miner that includes the transaction in a block.</p> <p>Bitcoin has always had builtin MEV, in the form of a block subsidy. The block subsidy, or block reward, is a way to create newly minted coins in the first transaction of a block (the coinbase transaction).</p> <p>As the idea of bitcoin continues to develop, on the Bitcoin Cash (BCH) fork, the built-in block subsidy will become less and less important and revenue from including transactions will come to dominate miner revenue.</p> <p>Anyone-can-spend outputs held by the drip-mine covenant by clicking the colorful icons above.</p> <p>When the value of an unspent transaction output locked by the covenant falls below 740 satoshis, all the value is claimed in the next transaction and the output is ‘burned’.</p> <p>Anyone may contribute to the MEV fund by sending outputs to the address below:</p>",1);function Ht(y){var s=Yt();Pt(12),u(y,s)}const $t="https://libauth.org/schemas/wallet-template-v0.schema.json",zt=`Drip Mine: An MEV faucet
 Contributed by Bitcoin Cash Autist - 2025 
 https://gitlab.com/0353F40E/drip-mine`,Gt="DripMine",Qt={covenant:{description:"Emit MEV as fees to miners.",name:"Drip Mine",scripts:["unlock_return","unlock_burn"]}},Kt={base:{description:"A set of working parameters with a half-life of decay of roughly four years",name:"Base Scenario",transaction:{inputs:[{outpointIndex:0,unlockingBytecode:["slot"],sequenceNumber:1}],outputs:[{lockingBytecode:{script:"lock"}}],locktime:0,version:2},sourceOutputs:[{lockingBytecode:["slot"]}]},return:{description:"Drip value as fee, returning balance to thread.",extends:"base",name:"Drip",transaction:{outputs:[{valueSatoshis:4536}]},sourceOutputs:[{lockingBytecode:["slot"],valueSatoshis:4700}]},burn:{description:"Burn value below threshold as OP_RETURN.",extends:"base",name:"Drip Burn",transaction:{outputs:[{lockingBytecode:{script:"op_return"}}]},sourceOutputs:[{lockingBytecode:["slot"],valueSatoshis:500}]}},Wt={unlock_return:{passes:["return"],name:"Drip MEV",script:"// empty",unlocks:"lock"},unlock_burn:{passes:["burn"],name:"Final MEV Burn",script:"// empty",unlocks:"lock"},op_return:{lockingType:"standard",name:"OP_RETURN",script:"OP_RETURN"},lock:{lockingType:"p2sh32",name:"Drip Mine Covenant",script:`// Drip Mine: An MEV faucet
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
`}},Jt=["BCH_2023_05"],Zt=0,te={$schema:$t,description:zt,name:Gt,entities:Qt,scenarios:Kt,scripts:Wt,supported:Jt,version:Zt},ee="@unspent/drip",ne={name:ee},tt=576,w=164,se=4392,ae=1333036486;class P{static USER_AGENT=ne.name;static template=te;static compiler=Bt(this.template);static getLockingBytecode(s={}){const n=this.compiler.generateBytecode({data:s,scriptId:"lock"});if(!n.success)throw new Error("Failed to generate bytecode, script: , "+Z(n));return n.bytecode}static getScriptHash(s=!0){return At(this.getLockingBytecode(),s)}static getAddress(s="bitcoincash"){return Mt(this.getLockingBytecode(),s)}static getOutput(s){let n=Math.round(s.value*se/ae)-1;n=n<w?w:n;let o=s.value-n;return s.value>BigInt(tt+w)?{lockingBytecode:{compiler:this.compiler,script:"lock"},valueSatoshis:BigInt(o)}:{lockingBytecode:U("6a"),valueSatoshis:BigInt(0)}}static getInput(s){let n=s.value>BigInt(tt+w)?"unlock_return":"unlock_burn";return{outpointIndex:s.tx_pos,outpointTransactionHash:U(s.tx_hash),sequenceNumber:1,unlockingBytecode:{compiler:this.compiler,script:n,valueSatoshis:BigInt(s.value)}}}static processOutpoint(s){const n=[],o=[];o.push(this.getOutput(s)),n.push(this.getInput(s));const g=Lt({locktime:0,version:2,inputs:n,outputs:o});if(!g.success)throw new Error("generate transaction failed!, errors: "+Z(g.errors));return et(Rt(g.transaction))}}const oe="data:image/svg+xml,%3csvg%20style='height:400px;width:400px'%20version='1.1'%20viewBox='0%200%2016%2016'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%3e%3cdefs%3e%3cradialGradient%20id='a'%20cx='7.24'%20cy='7.07'%20r='3.73'%20gradientTransform='matrix(-.551%201.72%20-1.8%20-.576%2022.2%20-.713)'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%23b7ffff'%20stop-opacity='.839'%20offset='.05'/%3e%3cstop%20stop-color='%230052ef'%20offset='.95'/%3e%3c/radialGradient%3e%3c/defs%3e%3cpath%20d='m8.28%203.09c0.21-0.784%203.87%202.13%203.87%205.16%200%201.99-1.34%203.52-3.57%203.51-2.44%200-3.9-1.33-3.9-3.23%200-2.05%202.88-2.74%203.6-5.44z'%20fill='url(%23a)'/%3e%3c/svg%3e";var ie=_('<meta name="description" content="Release the miner extractable value (MEV)!"/>'),re=_("<img/>"),ce=_('<img alt="Disconnected"/>'),le=(y,s)=>s(),ue=_('<div class="row svelte-1w1ojhb"><button class="svelte-1w1ojhb"><img/></button></div>'),pe=_("<p>No spendable outputs, check back in 10 minutes.</p>"),he=_('<div class="row svelte-1w1ojhb"><button disabled class="svelte-1w1ojhb"><img/></button></div>'),de=_("<p>No pending transactions</p>"),me=_('<section class="svelte-1w1ojhb"><div class="status svelte-1w1ojhb"><!> <!></div> <h1>Release the miner extractable value (MEV)!</h1> <div class="header svelte-1w1ojhb"><button class="svelte-1w1ojhb">Release all Miner Extractable Value (MEV)</button></div> <h3>Unspent Transaction Outputs (utxos)</h3> <div class="grid svelte-1w1ojhb"><!></div> <h3>Mempool Transactions</h3> <div class="grid svelte-1w1ojhb"><!></div> <!> <qr-code><img slot="icon" alt="drip MEV icon"/></qr-code> <pre id="deposit"> </pre></section>',2);function Me(y,s){yt(s,!1);let n=$([]),o,x="";x=P.getScriptHash();let g="",T=$(""),D=new Set,S,L=K.url.hostname=="vox.cash"?"bitcoincash":"bchtest",nt=K.url.hostname=="vox.cash"?"bch.imaginary.cash":"chipnet.bch.ninja";const st=()=>{clearTimeout(S),S=setTimeout(()=>{D=new Set},1e4)},at=function(t){t.method==="blockchain.scripthash.subscribe"?t.params[1]!==g&&(g=t.params[1],k(T,J[o.status]),q()):console.log(t)},ot=async function(t){let e=await o.request("blockchain.transaction.broadcast",t);if(e instanceof Error)throw k(T,J[o.status]),e},it=function(){a(n).filter(t=>t.height>0).map((t,e)=>{X(t,e)})},X=async function(t,e){let h=P.processOutpoint(t),i=Ct(U(h));if(typeof i=="string")throw i;D.add(`${t.tx_hash}":"${t.tx_pos}`),st();let d=Vt(et(St(U(h)))),m=Number(i.outputs[0].valueSatoshis);a(n).splice(e,1);let v=a(n).filter(r=>r.height>0||r.value<m?!0:r.value==m&&r.tx_hash<d).length;a(n).splice(v,0,{height:0,tx_hash:d,value:m}),k(n,a(n)),await ot(h)},q=async function(){let t=await o.request("blockchain.scripthash.listunspent",x,"exclude_tokens");if(t instanceof Error)throw t;let e=new Set(t.map(h=>`${h.tx_hash}":"${h.tx_pos}`));(a(n).length==0||D.intersection(e).size==0)&&k(n,t)};Ot(async()=>{o=new Nt(P.USER_AGENT,"1.4.1",nt),await o.connect(),o.on("notification",at),await o.subscribe("blockchain.scripthash.subscribe",x),q()}),Et(async()=>{await o.disconnect()}),Dt();var N=me();kt(t=>{var e=ie();Tt.title="Drip Mine",u(t,e)});var B=c(N),F=c(B);qt(F,{get template(){return P.template}});var rt=b(F,2);{var ct=t=>{var e=re();O(()=>{f(e,"src",Xt),f(e,"alt",a(T))}),u(t,e)},lt=t=>{var e=ce();O(()=>f(e,"src",Ft)),u(t,e)};V(rt,t=>{a(T)=="CONNECTED"?t(ct):t(lt,!1)})}l(B);var A=b(B,4),ut=c(A);ut.__click=[le,it],l(A);var M=b(A,4),pt=c(M);{var ht=t=>{var e=H(),h=z(e);G(h,1,()=>a(n).filter(i=>i.height>0),Q,(i,d,m)=>{var v=ue(),r=c(v);r.__click=()=>X(a(d),m);var I=c(r);l(r),l(v),O(gt=>{f(I,"src",gt),f(I,"alt",a(d).tx_hash)},[()=>W(`0x${a(d).tx_hash}`,32)],C),u(i,v)}),u(t,e)},dt=t=>{var e=pe();u(t,e)};V(pt,t=>{a(n).filter(e=>e.height>0).length>0?t(ht):t(dt,!1)})}l(M);var R=b(M,4),mt=c(R);{var _t=t=>{var e=H(),h=z(e);G(h,1,()=>a(n).filter(i=>i.height<=0),Q,(i,d)=>{var m=he(),v=c(m),r=c(v);l(v),l(m),O(I=>{f(r,"src",I),f(r,"alt",a(d).tx_hash)},[()=>W(`0x${a(d).tx_hash}`,32)],C),u(i,m)}),u(t,e)},vt=t=>{var e=de();u(t,e)};V(mt,t=>{a(n).filter(e=>e.height<=0).length>0?t(_t):t(vt,!1)})}l(R);var j=b(R,2);Ht(j);var p=b(j,2);E(p,"id","qr1"),O(()=>E(p,"contents",P.getAddress(L))),E(p,"module-color","#000"),E(p,"position-ring-color","#0052ef"),E(p,"position-center-color","#b7ffff"),E(p,"mask-x-to-y-ratio","1.2"),Ut(p,`width: 150px;
									height: 150px;
									margin: 0.5em auto;
									background-color: #fff;`);var ft=c(p);l(p);var Y=b(p,2),bt=c(Y,!0);l(Y),l(N),O(t=>{f(ft,"src",oe),wt(bt,t)},[()=>P.getAddress(L)],C),u(y,N),xt()}It(["click"]);export{Me as component,Ae as universal};
//# sourceMappingURL=8.DNqKKENK.js.map
