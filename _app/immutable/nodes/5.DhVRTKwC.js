import{f,a as p,c as J}from"../chunks/DIGK3fbx.js";import"../chunks/D2hU0Bvh.js";import{o as Tt,a as It}from"../chunks/gevkG0Tn.js";import{a0 as kt,p as wt,c as o,t as E,a as Ut,D as i,C as w,ao as Nt,s as _,K as L,n as W,r,f as Z}from"../chunks/D9HGzNEp.js";import{d as Dt,h as Bt,s as q}from"../chunks/DLwNFu-O.js";import{i as X}from"../chunks/CKOgfgCC.js";import{e as tt,i as et}from"../chunks/Clu73D2-.js";import{a as P,s as g}from"../chunks/8RjDFi4k.js";import{s as At}from"../chunks/964CQeWy.js";import{p as nt,i as Ct}from"../chunks/DqFcnqea.js";import{b as st}from"../chunks/B8sppVjI.js";import{$ as at,a as it}from"../chunks/CQVT_UhJ.js";import{t as F,j as Mt,l as Rt,m as St,i as N,q as Vt,E as Lt,B as qt,F as Xt,G as Ft,H as $t,C as Ht,D as Yt}from"../chunks/To2mxZKB.js";const Gt=2,ot=(O,s=Gt)=>JSON.stringify(O,(n,a)=>{const m=typeof a=="object"&&a!==null?a.constructor.name:typeof a;switch(m){case"Uint8Array":return`<Uint8Array: 0x${F(a)}>`;case"bigint":return`<bigint: ${a.toString()}n>`;case"function":case"symbol":return`<${m}: ${a.toString()}>`;default:return a}},s),zt=!0,Be=Object.freeze(Object.defineProperty({__proto__:null,prerender:zt},Symbol.toStringTag,{value:"Module"}));var Qt=f("<h3>About Drip Mine</h3> <p>Drip mine is a contract demonstrating the potential of Miner Extractable Value (MEV). Each output of the contract can be spent by anyone, each transaction generates fees that benefit miner that includes the transaction in a block.</p> <p>Bitcoin has always had builtin MEV, in the form of a block subsidy. The block subsidy, or block reward, is a way to create newly minted coins in the first transaction of a block (the coinbase transaction).</p> <p>As the idea of bitcoin continues to develop, on the Bitcoin Cash (BCH) fork, the built-in block subsidy will become less and less important and revenue from including transactions will come to dominate miner revenue.</p> <p>Anyone-can-spend outputs held by the drip-mine covenant by clicking the colorful icons above.</p> <p>When the value of an unspent transaction output locked by the covenant falls below 740 satoshis, all the value is claimed in the next transaction and the output is ‘burned’.</p> <p>Anyone may contribute to the MEV fund by sending outputs to the address below:</p>",1);function jt(O){var s=Qt();kt(12),p(O,s)}const Kt="https://libauth.org/schemas/wallet-template-v0.schema.json",Jt=`Drip Mine: An MEV faucet
 Contributed by Bitcoin Cash Autist - 2025 
 https://gitlab.com/0353F40E/drip-mine`,Wt="DripMine",Zt={covenant:{description:"Emit MEV as fees to miners.",name:"Drip Mine",scripts:["unlock_return","unlock_burn"]}},te={base:{description:"A set of working parameters with a half-life of decay of roughly four years",name:"Base Scenario",transaction:{inputs:[{outpointIndex:0,unlockingBytecode:["slot"],sequenceNumber:1}],outputs:[{lockingBytecode:{script:"lock"}}],locktime:0,version:2},sourceOutputs:[{lockingBytecode:["slot"]}]},return:{description:"Drip value as fee, returning balance to thread.",extends:"base",name:"Drip",transaction:{outputs:[{valueSatoshis:4536}]},sourceOutputs:[{lockingBytecode:["slot"],valueSatoshis:4700}]},burn:{description:"Burn value below threshold as OP_RETURN.",extends:"base",name:"Drip Burn",transaction:{outputs:[{lockingBytecode:{script:"op_return"}}]},sourceOutputs:[{lockingBytecode:["slot"],valueSatoshis:500}]}},ee={unlock_return:{passes:["return"],name:"Drip MEV",script:"// empty",unlocks:"lock"},unlock_burn:{passes:["burn"],name:"Final MEV Burn",script:"// empty",unlocks:"lock"},op_return:{lockingType:"standard",name:"OP_RETURN",script:"OP_RETURN"},lock:{lockingType:"p2sh32",name:"Drip Mine Covenant",script:`// Drip Mine: An MEV faucet
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
`}},ne=["BCH_2023_05"],se=0,ae={$schema:Kt,description:Jt,name:Wt,entities:Zt,scenarios:te,scripts:ee,supported:ne,version:se},ie="@unspent/drip",oe={name:ie},rt=576,U=164,re=4392,ce=1333036486;class x{static USER_AGENT=oe.name;static template=ae;static compiler=Mt(this.template);static getLockingBytecode(s={}){const n=this.compiler.generateBytecode({data:s,scriptId:"lock"});if(!n.success)throw new Error("Failed to generate bytecode, script: , "+ot(n));return n.bytecode}static getScriptHash(s=!0){return Rt(this.getLockingBytecode(),s)}static getAddress(s="bitcoincash"){return St(this.getLockingBytecode(),s)}static getOutput(s){let n=Math.round(s.value*re/ce)-1;n=n<U?U:n;let a=s.value-n;return s.value>BigInt(rt+U)?{lockingBytecode:{compiler:this.compiler,script:"lock"},valueSatoshis:BigInt(a)}:{lockingBytecode:N("6a"),valueSatoshis:BigInt(0)}}static getInput(s){let n=s.value>BigInt(rt+U)?"unlock_return":"unlock_burn";return{outpointIndex:s.tx_pos,outpointTransactionHash:N(s.tx_hash),sequenceNumber:1,unlockingBytecode:{compiler:this.compiler,script:n,valueSatoshis:BigInt(s.value)}}}static processOutpoint(s){const n=[],a=[];a.push(this.getOutput(s)),n.push(this.getInput(s));const m=Vt({locktime:0,version:2,inputs:n,outputs:a});if(!m.success)throw new Error("generate transaction failed!, errors: "+ot(m.errors));return F(Lt(m.transaction))}}const le="data:image/svg+xml,%3csvg%20style='height:400px;width:400px'%20version='1.1'%20viewBox='0%200%2016%2016'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%3e%3cdefs%3e%3cradialGradient%20id='a'%20cx='7.24'%20cy='7.07'%20r='3.73'%20gradientTransform='matrix(-.551%201.72%20-1.8%20-.576%2022.2%20-.713)'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%23b7ffff'%20stop-opacity='.839'%20offset='.05'/%3e%3cstop%20stop-color='%230052ef'%20offset='.95'/%3e%3c/radialGradient%3e%3c/defs%3e%3cpath%20d='m8.28%203.09c0.21-0.784%203.87%202.13%203.87%205.16%200%201.99-1.34%203.52-3.57%203.51-2.44%200-3.9-1.33-3.9-3.23%200-2.05%202.88-2.74%203.6-5.44z'%20fill='url(%23a)'/%3e%3c/svg%3e";var ue=f('<meta name="description" content="Release miner extractable value (MEV) on Bitcoin Cash (BCH) from your browser!"/>'),pe=f("<img/>"),de=f('<img alt="Disconnected"/>'),he=(O,s)=>s(),me=f('<div class="row svelte-1svrxbd"><button class="svelte-1svrxbd"><img/> <p class="svelte-1svrxbd"> </p></button></div>'),ve=f("<p>No spendable outputs, check back in 10 minutes.</p>"),_e=f('<div class="row svelte-1svrxbd"><button disabled class="svelte-1svrxbd"><img/> <p class="svelte-1svrxbd"> </p></button></div>'),fe=f("<p>No pending transactions</p>"),be=f('<section class="svelte-1svrxbd"><div class="status svelte-1svrxbd"><!> <!></div> <h1>Release miner extractable value (MEV) on Bitcoin Cash (BCH) from your browser!</h1> <div class="header svelte-1svrxbd"><button class="svelte-1svrxbd">Release all Miner Extractable Value (MEV)</button></div> <h3>Unspent Transaction Outputs (utxos)</h3> <div class="grid svelte-1svrxbd"><!></div> <h3>Mempool Transactions</h3> <div class="grid svelte-1svrxbd"><!></div> <!> <qr-code><img slot="icon"/></qr-code> <pre id="deposit"> </pre></section>',2);function Ae(O,s){wt(s,!1);let n=W([]),a,T="";T=x.getScriptHash();let m="",I=W(""),D=new Set,$,H=nt.url.hostname=="vox.cash"?"bitcoincash":"bchtest",Y=nt.url.hostname=="vox.cash"?"bch.imaginary.cash":"chipnet.bch.ninja";const ct=()=>{clearTimeout($),$=setTimeout(()=>{D=new Set},1e4)},lt=function(t){t.method==="blockchain.scripthash.subscribe"?t.params[1]!==m&&(m=t.params[1],w(I,at[a.status]),z()):console.log(t)},ut=async function(t){let e=await a.request("blockchain.transaction.broadcast",t);if(e instanceof Error)throw w(I,at[a.status]),e},pt=function(){i(n).filter(t=>t.height>0).map((t,e)=>{G(t,e)})},G=async function(t,e){let h=x.processOutpoint(t),l=Xt(N(h));if(typeof l=="string")throw l;D.add(`${t.tx_hash}":"${t.tx_pos}`),ct();let u=Ft(F($t(N(h)))),v=Number(l.outputs[0].valueSatoshis);i(n).splice(e,1);let b=i(n).filter(c=>c.height>0||c.value<v?!0:c.value==v&&c.tx_hash<u).length;i(n).splice(b,0,{height:0,tx_hash:u,value:v}),w(n,i(n)),await ut(h)},z=async function(){let t=await a.request("blockchain.scripthash.listunspent",T,"exclude_tokens");if(t instanceof Error)throw t;let e=new Set(t.map(h=>`${h.tx_hash}":"${h.tx_pos}`));(i(n).length==0||D.intersection(e).size==0)&&w(n,t)};Tt(async()=>{a=new it(x.USER_AGENT,"1.4.1",Y),await a.connect(),a.on("notification",lt),await a.subscribe("blockchain.scripthash.subscribe",T),z()}),It(async()=>{await new it("unspent/drip","1.4.1",Y).disconnect()}),Ct();var B=be();Bt(t=>{var e=ue();Nt.title="Drip Mine",p(t,e)});var A=o(B),Q=o(A);{var dt=t=>{var e=pe();E(()=>{g(e,"src",Ht),g(e,"alt",i(I))}),p(t,e)},ht=t=>{var e=de();E(()=>g(e,"src",Yt)),p(t,e)};X(Q,t=>{i(I)=="CONNECTED"?t(dt):t(ht,!1)})}var mt=_(Q,2);qt(mt,{get template(){return x.template}}),r(A);var C=_(A,4),vt=o(C);vt.__click=[he,pt],r(C);var M=_(C,4),_t=o(M);{var ft=t=>{var e=J(),h=Z(e);tt(h,1,()=>i(n).filter(l=>l.height>0),et,(l,u,v)=>{var b=me(),c=o(b);c.__click=()=>G(i(u),v);var y=o(c),k=_(y,2),S=o(k,!0);r(k),r(c),r(b),E((V,xt)=>{g(y,"src",V),g(y,"alt",i(u).tx_hash),q(S,xt)},[()=>st(`0x${i(u).tx_hash}`),()=>Number(i(u).value).toLocaleString()],L),p(l,b)}),p(t,e)},bt=t=>{var e=ve();p(t,e)};X(_t,t=>{i(n).filter(e=>e.height>0).length>0?t(ft):t(bt,!1)})}r(M);var R=_(M,4),gt=o(R);{var Ot=t=>{var e=J(),h=Z(e);tt(h,1,()=>i(n).filter(l=>l.height<=0),et,(l,u)=>{var v=_e(),b=o(v),c=o(b),y=_(c,2),k=o(y,!0);r(y),r(b),r(v),E((S,V)=>{g(c,"src",S),g(c,"alt",i(u).tx_hash),q(k,V)},[()=>st(`0x${i(u).tx_hash}`),()=>Number(i(u).value).toLocaleString()],L),p(l,v)}),p(t,e)},yt=t=>{var e=fe();p(t,e)};X(gt,t=>{i(n).filter(e=>e.height<=0).length>0?t(Ot):t(yt,!1)})}r(R);var j=_(R,2);jt(j);var d=_(j,2);P(d,"id","qr1"),E(()=>P(d,"contents",x.getAddress(H))),P(d,"module-color","#000"),P(d,"position-ring-color","#0052ef"),P(d,"position-center-color","#b7ffff"),P(d,"mask-x-to-y-ratio","1.2"),At(d,`width: 150px;
									height: 150px;
									margin: 0.5em auto;
									background-color: #fff;`);var Et=o(d);r(d);var K=_(d,2),Pt=o(K,!0);r(K),r(B),E(t=>{g(Et,"src",le),q(Pt,t)},[()=>x.getAddress(H)],L),p(O,B),Ut()}Dt(["click"]);export{Ae as component,Be as universal};
//# sourceMappingURL=5.DhVRTKwC.js.map
