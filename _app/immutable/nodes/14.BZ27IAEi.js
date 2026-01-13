import{f as O,a as l}from"../chunks/DTc5U4eY.js";import{aA as T,p as g,a as E,c as m,s as P,r as h,t as f}from"../chunks/CQU5mOuk.js";import{i as b}from"../chunks/CZ0rTjPC.js";import{s as U}from"../chunks/-rOGAMhN.js";import"../chunks/CuzQ0eOn.js";import{B as I}from"../chunks/BzLj6JBc.js";import{D as k}from"../chunks/DMvn4Q5j.js";import{g as y,h as p,r as _,d as N,e as v,f as A,v as R,b as x,k as S}from"../chunks/BQUio51k.js";import{c as B}from"../chunks/DGwzT_kg.js";const C=!0,ae=Object.freeze(Object.defineProperty({__proto__:null,prerender:C},Symbol.toStringTag,{value:"Module"}));var L=O('<h3>About Subscriptions</h3> <p>Setup subscriptions paying in CashTokens for regular payments to a pre-defined address.</p> <p>Subscribers can cancel at any time and withdraw the balance of the pre-paid fund using an NFT “key card”.</p> <p>More about the <a href="https://bitcoincashresearch.org/t/unspent-phi-v3-timelocking-token-aware-contracts/1501#subscriptions-share-vesting-revocable-token-annuities-3" rel="nofollow">contract here</a></p> <h3>See Also:</h3> <p><a href="https://github.com/KarolTrzeszczkowski/Mecenas-recurring-payment-EC-plugin" rel="nofollow">Mecenas</a> by Karol Trzeszczkowski (Licho#14431)</p>',1);function q(c){var t=L();T(10),l(c,t)}const w="https://libauth.org/schemas/wallet-template-v0.schema.json",D="Subscription: a CashToken contract for recurring automatic payments.",F="Subscription",V={covenant:{description:`Hold asset in escrow for a subscription. 

Regular installments will be made automatically at regular intervals. The balance can be administered with authorizing NFT baton.`,name:"Subscription Vault",scripts:["lock","step","administer"],variables:{auth:{description:"CashToken Category of the NFT series administering the subscription.",name:"Authentication Token Category",type:"WalletData"},period:{description:"The time period between installment payments.",name:"Period",type:"WalletData"},recipient:{description:"The entity the subscription will pay.",name:"Recipient",type:"WalletData"},installment:{description:"The installment value, denominated in CashTokens.",name:"Installment",type:"WalletData"}}}},Y={base:{data:{bytecode:{installment:"1000",auth:"0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",period:"144",recipient:"0xa914e78564d75c446f8c00c757a2bd783d30c4f0819a87"}},description:"",name:"Base Scenario"},release:{data:{bytecode:{locktime:"144",recipient:"0xa914e78564d75c446f8c00c757a2bd783d30c4f0819a87"}},description:"",extends:"base",name:"Release Assets",transaction:{inputs:[{unlockingBytecode:["slot"],sequenceNumber:144}],outputs:[{lockingBytecode:"a914e78564d75c446f8c00c757a2bd783d30c4f0819a87",valueSatoshis:800}],locktime:11,version:2},sourceOutputs:[{lockingBytecode:["slot"],valueSatoshis:800}]}},M={step:{passes:["release"],name:"Process Installment",script:"OP_0",unlocks:"lock"},administer:{passes:["release"],name:"Administer",script:"OP_1  // ",unlocks:"lock"},lock:{lockingType:"p2sh32",name:"Subscription Covenant",script:`<installment>  <recipient> <period>  <auth>


OP_4 OP_PICK OP_0 OP_NUMEQUAL OP_IF 
// function execute() {

    // Require version 2 for BIP68 support
       OP_TXVERSION OP_2 OP_NUMEQUALVERIFY 
    // require(tx.version == 2);

    // Require a single utxo input
       OP_TXINPUTCOUNT OP_1 OP_NUMEQUALVERIFY 
    // require(tx.inputs.length == 1);

    // Require a rolling timelock is satisfied
       OP_SWAP OP_CHECKSEQUENCEVERIFY OP_DROP 
    // require(tx.age >= period);

    // Require payment in the same token
       OP_0 OP_OUTPUTTOKENCATEGORY OP_INPUTINDEX OP_UTXOTOKENCATEGORY OP_EQUALVERIFY 
    // require(tx.outputs[0].tokenCategory == tx.inputs[this.activeInputIndex].tokenCategory);

    // Require that each output sends to the intended recipient
       OP_0 OP_OUTPUTBYTECODE OP_ROT OP_EQUALVERIFY 
    // require(tx.outputs[0].lockingBytecode == recipientLockingBytecode);

    // If not enough tokens remain to fulfill an installment,
       OP_INPUTINDEX OP_UTXOTOKENAMOUNT OP_2 OP_PICK OP_LESSTHANOREQUAL OP_IF 
    // if(tx.inputs[this.activeInputIndex].tokenAmount <= installment){

        // require token liquidation
           OP_0 OP_OUTPUTTOKENAMOUNT OP_INPUTINDEX OP_UTXOTOKENAMOUNT OP_NUMEQUALVERIFY 
        // require(tx.outputs[0].tokenAmount == tx.inputs[this.activeInputIndex].tokenAmount);

        // utxo sats are unencumbered in the final installment

    // } 
    OP_ELSE 
   // else {
        
        // Require minimum token dust  
           OP_0 OP_OUTPUTVALUE <800> OP_NUMEQUALVERIFY 
        // require(tx.outputs[0].value == 800);

        // Require that installment paid
           OP_0 OP_OUTPUTTOKENAMOUNT OP_2 OP_PICK OP_NUMEQUALVERIFY 
        // require(tx.outputs[0].tokenAmount == installment);

        // Require the executor fee is not excessive 
           OP_1 OP_OUTPUTVALUE OP_INPUTINDEX OP_UTXOVALUE <5000> OP_SUB OP_GREATERTHANOREQUAL OP_VERIFY 
        // require(tx.outputs[1].value >= tx.inputs[this.activeInputIndex].value - 5000);
            
        // Require that the token remainder after installment is returned
           OP_1 OP_OUTPUTTOKENAMOUNT OP_INPUTINDEX OP_UTXOTOKENAMOUNT OP_3 OP_PICK OP_SUB OP_GREATERTHANOREQUAL OP_VERIFY 
        // require(tx.outputs[1].tokenAmount >=  tx.inputs[this.activeInputIndex].tokenAmount - installment);
 
        // Require the token category is identical
           OP_1 OP_OUTPUTTOKENCATEGORY OP_INPUTINDEX OP_UTXOTOKENCATEGORY OP_EQUALVERIFY 
        // require(tx.outputs[1].tokenCategory == tx.inputs[this.activeInputIndex].tokenCategory);

        // Require the second output match the active bytecode
           OP_1 OP_OUTPUTBYTECODE OP_INPUTINDEX OP_UTXOBYTECODE OP_EQUALVERIFY 
        // require(tx.outputs[1].lockingBytecode == tx.inputs[this.activeInputIndex].lockingBytecode);

    // } 
    OP_ENDIF

  //} 
  OP_2DROP OP_DROP

  // Withdraw or adjust balances.
    OP_1 OP_ELSE OP_4 OP_ROLL OP_1 OP_NUMEQUALVERIFY 
//  function administer() {

      // Transactions beginning with a minting auth baton are unrestricted
         OP_0 OP_UTXOTOKENCATEGORY OP_SWAP OP_2 OP_CAT OP_EQUAL
      // require(tx.inputs[0].tokenCategory == authCat + 0x02);

// }
OP_NIP OP_NIP OP_NIP 
  
// } 
OP_ENDIF`}},K=["BCH_2023_05","BCH_SPEC"],X={$schema:w,description:D,name:F,entities:V,scenarios:Y,scripts:M,supported:K},Q="@unspent/subscription",H={name:Q};class z{static USER_AGENT=H.name;static PROTOCOL_IDENTIFIER="U3S";static tokenAware=!0;static template=X;static compiler=y(this.template);static vm=B();static dataToBytecode(t){return{installment:_(t.installment),recipient:p(t.recipient),period:_(t.period),auth:p(t.auth)}}static getLockingBytecode(t){const e=this.compiler.generateBytecode({data:{bytecode:this.dataToBytecode(t)},scriptId:"lock"});if(!e.success)throw new Error("Failed to generate bytecode, script: , "+JSON.stringify(e,null,"  "));return e.bytecode}static getUnlockingBytecode(t){const e=this.compiler.generateBytecode({data:{bytecode:this.dataToBytecode(t)},scriptId:"step"});if(!e.success)throw new Error("Failed to generate bytecode, script: , "+JSON.stringify(e,null,"  "));return e.bytecode}static getScriptHash(t,e=!0){return N(this.getLockingBytecode(t),e)}static getAddress(t,e="bitcoincash"){return v(this.getLockingBytecode(t),e,this.tokenAware)}static getSourceOutput(t,e){return{lockingBytecode:this.getLockingBytecode(t),valueSatoshis:BigInt(e.value)}}static getInput(t,e){return{outpointIndex:e.tx_pos,outpointTransactionHash:p(e.tx_hash),sequenceNumber:e.value,unlockingBytecode:{data:{bytecode:this.dataToBytecode(t)},compiler:this.compiler,script:"unlock",valueSatoshis:BigInt(e.value)}}}static getOutput(){return{lockingBytecode:{data:{},compiler:this.compiler,script:"op_return"},valueSatoshis:BigInt(0)}}static getSourceOutputs(t,e){const n=[];return n.push(...e.map(s=>this.getSourceOutput(t,s))),n}static step(t,e){let a={locktime:0,version:2,inputs:[],outputs:[]};a.inputs.push(this.getInput(t,e)),a.outputs.push(this.getOutput());let o=A(a);if(!o.success)throw new Error("generate transaction failed!, errors: "+JSON.stringify(o.errors,null,"  "));const u=[this.getSourceOutput(t,e)],i=o.transaction,r=R(i,u,{maximumTokenCommitmentLength:40});if(r!==!0)throw r;let d=this.vm.verify({sourceOutputs:u,transaction:i});if(typeof d=="string")throw d;return x(S(i))}}var G=O('<img alt="Disconnected"/>'),j=O('<section><div class="status svelte-1jejjaq"><!> <!></div> <!></section>');function oe(c,t){g(t,!0);var e=j(),n=m(e),s=m(n);I(s,{get template(){return z.template}});var a=P(s,2);{var o=i=>{var r=G();f(()=>U(r,"src",k)),l(i,r)};b(a,i=>{i(o,!1)})}h(n);var u=P(n,2);q(u),h(e),l(c,e),E()}export{oe as component,ae as universal};
//# sourceMappingURL=14.BZ27IAEi.js.map
