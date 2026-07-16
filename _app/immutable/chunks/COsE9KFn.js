import{h as i,i as A,k as N,l as S,n as y,o as U,p as P,m as _,q as R,v as w,s as E,r as p}from"./D6NMCXg_.js";import{c as C}from"./BESLs7BN.js";const L="https://libauth.org/schemas/wallet-template-v0.schema.json",V="BlockPoints: A coin age reward token",q="BlockPoints",x={covenant:{description:"Emit tokens as reward to holders.",name:"BlockPoint Vault",scripts:["lock","unlock"],variables:{age:{description:"The input age (as a number of blocks) claimed to withdraw tokens. The maximum age that can be used to claim tokens is the lessor of covenant thread age or user coins age being used to release tokens.",name:"Age",type:"WalletData"}}},wallet:{description:"",name:"Unnamed Entity",scripts:["wallet_unlock","wallet_lock"],variables:{key:{description:"The private key that controls this wallet.",name:"Key",type:"HdKey"}}}},D={base:{data:{bytecode:{age:"10"}},description:"",name:"Base Scenario"},release:{data:{bytecode:{age:"144"}},description:"",extends:"base",name:"Release Tokens",transaction:{inputs:[{unlockingBytecode:{script:"wallet_unlock"},sequenceNumber:144},{unlockingBytecode:["slot"],sequenceNumber:144}],outputs:[{lockingBytecode:{script:"lock"},valueSatoshis:800,token:{amount:"144",category:"dead00000000000000000000000000000000000000000000000000000000beef"}},{lockingBytecode:{script:"lock"},valueSatoshis:800,token:{amount:"144",category:"dead00000000000000000000000000000000000000000000000000000000beef"}}],locktime:0,version:2},sourceOutputs:[{lockingBytecode:{script:"wallet_lock"},valueSatoshis:1e8},{lockingBytecode:["slot"],valueSatoshis:10800,token:{amount:"288",category:"dead00000000000000000000000000000000000000000000000000000000beef"}}]}},H={unlock:{passes:["release"],name:"Unlock Tokens",script:"<age> // ",unlocks:"lock"},wallet_unlock:{name:"Wallet Unlock",script:"<key.schnorr_signature.all_outputs> <key.public_key>",unlocks:"wallet_lock"},lock:{lockingType:"p2sh32",name:"BlockPoint Covenant",script:`//contract BlockPointAirDrop() {

// function release(int age) {

      // require v2 for bip-68 timelocks 
      OP_TXVERSION OP_2 OP_NUMEQUALVERIFY 
      // require(tx.version == 2);

      // Force a block based relative timelock
      <500000000> OP_OVER OP_GREATERTHANOREQUAL OP_VERIFY
      //require(500000000 >= age);

      // Ensure the first input exceeds the age claimed
      OP_0 OP_INPUTSEQUENCENUMBER OP_OVER OP_GREATERTHANOREQUAL OP_VERIFY
      // require(tx.inputs[0].sequenceNumber >= age);
      
      // Require the token vault thread to exceed the age claimed
      OP_DUP OP_CHECKSEQUENCEVERIFY OP_DROP
      // require(tx.age >= age);

      // Allow anyone to withdraw a token amount proportional to the value of their aged utxo.
      // Note: to convert block satoshis to coindays: 144 * 100_000_000 
      // 
      OP_INPUTINDEX OP_OUTPUTTOKENAMOUNT 
      OP_INPUTINDEX OP_UTXOTOKENAMOUNT 
      OP_ROT OP_0 OP_UTXOVALUE OP_MUL <100000000> OP_DIV OP_SUB OP_GREATERTHANOREQUAL
      // require(
      //     tx.outputs[this.activeInputIndex].tokenAmount >= 
      //     tx.inputs[this.activeInputIndex].tokenAmount - 
      //     (age * tx.inputs[0].value/100000000)
      // );

      // Assure the same token category is returned.
      OP_VERIFY OP_INPUTINDEX OP_OUTPUTTOKENCATEGORY OP_INPUTINDEX OP_UTXOTOKENCATEGORY OP_EQUALVERIFY
      // require(tx.outputs[this.activeInputIndex].tokenCategory == tx.inputs[this.activeInputIndex].tokenCategory);


      // Require the second output match the active bytecode
      OP_INPUTINDEX OP_OUTPUTBYTECODE OP_INPUTINDEX OP_UTXOBYTECODE OP_EQUALVERIFY
      // require(tx.outputs[this.activeInputIndex].lockingBytecode == tx.inputs[this.activeInputIndex].lockingBytecode);

      // This thread must be in the second input position
      // to prevent users building transactions with multiple airdrop threads. 
      //
      OP_INPUTINDEX OP_1 OP_NUMEQUAL
      // require(this.activeInputIndex == 1);
// }
//}`},wallet_lock:{lockingType:"standard",name:"Wallet Lock",script:"OP_DUP OP_HASH160 <$(<key.public_key> OP_HASH160)> OP_EQUALVERIFY OP_CHECKSIG"}},K=["BCH_2023_05","BCH_SPEC"],F={$schema:L,description:V,name:q,entities:x,scenarios:D,scripts:H,supported:K},X="@unspent/blockpoint",Y={name:X},I=i("7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c"),W=i("8214f234225e5f555663290e0fb7b7b607bf0778221e6da97248bf020306831b");class ${static USER_AGENT=Y.name;static tokenAware=!0;static template=F;static compiler=A(this.template);static vm=C();static getLockingBytecode(t={}){const e=this.compiler.generateBytecode({data:t,scriptId:"lock"});if(!e.success)throw new Error("Failed to generate bytecode, script: , "+JSON.stringify(e,null,"  "));return e.bytecode}static getScriptHash(t=!0){return N(this.getLockingBytecode(),t)}static getAddress(t="bitcoincash"){return S(this.getLockingBytecode(),t,this.tokenAware)}static getSourceOutput(t){return{lockingBytecode:this.getLockingBytecode(),valueSatoshis:BigInt(t.value),token:{category:i(t.token_data.category),amount:BigInt(t.token_data?.amount)}}}static getInput(t,e){return{outpointIndex:t.tx_pos,outpointTransactionHash:i(t.tx_hash),sequenceNumber:e,unlockingBytecode:{data:{bytecode:{age:y(BigInt(e))}},compiler:this.compiler,script:"unlock",valueSatoshis:BigInt(t.value)}}}static getOutput(t,e,n){return{lockingBytecode:{data:{bytecode:{age:y(BigInt(n))}},compiler:this.compiler,script:"lock"},valueSatoshis:BigInt(t.value),token:{category:i(t.token_data.category),amount:BigInt(t.token_data?.amount)-BigInt(e)}}}static getWalletSourceOutput(t,e){return{lockingBytecode:e?U({addressIndex:0,hdPrivateKey:e}):Uint8Array.from(Array(33)),valueSatoshis:BigInt(t.value),token:t.token_data?{category:i(t.token_data.category),amount:BigInt(t.token_data?.amount)}:void 0}}static getWalletInput(t,e,n,o=0){const a=n?{compiler:this.compiler,data:{hdKeys:{addressIndex:o,hdPrivateKeys:{wallet:n}}},script:"wallet_unlock",valueSatoshis:BigInt(t.value)}:Uint8Array.from(Array());return{outpointIndex:t.tx_pos,outpointTransactionHash:i(t.tx_hash),sequenceNumber:e,unlockingBytecode:a}}static getTokenOutput(t,e,n=0,o=I){return{lockingBytecode:e?{compiler:this.compiler,data:{hdKeys:{addressIndex:n,hdPublicKeys:{wallet:P(e).hdPublicKey}}},script:"wallet_lock"}:Uint8Array.from(Array(33)),valueSatoshis:800n,token:{category:o,amount:BigInt(t)}}}static getChangeOutput(t,e,n=0){return{lockingBytecode:e?{compiler:this.compiler,data:{hdKeys:{addressIndex:n,hdPublicKeys:{wallet:P(e).hdPublicKey}}},script:"wallet_lock"}:Uint8Array.from(Array(33)),valueSatoshis:BigInt(t.value)-800n}}static getSourceOutputs(t,e,n){const o=[];return o.push(this.getWalletSourceOutput(e,n)),o.push(this.getSourceOutput(t)),o}static claim(t,e,n,o,a,h=1){const T=[],B=[];let v=a?i(a):I;const b=n.height>e.height?n.height:e.height,d=t-b,g=Math.floor(d*n.value/1e8);let s={locktime:0,version:2,inputs:T,outputs:B};s.inputs.push(this.getWalletInput(n,d,o)),s.outputs.push(this.getTokenOutput(g,o,0,v)),s.inputs.push(this.getInput(e,d)),s.outputs.push(this.getOutput(e,g,d)),s.outputs.push(this.getChangeOutput(n,o,0));let c=_(s);if(!c.success)throw new Error("generate transaction failed!, errors: "+JSON.stringify(c.errors,null,"  "));const f=R(c.transaction,h);if(s.outputs[2].valueSatoshis=s.outputs[2].valueSatoshis-f,c=_(s),!c.success)throw new Error("generate transaction failed!, errors: "+JSON.stringify(c.errors,null,"  "));const r=this.getSourceOutputs(e,n,o),u=c.transaction,k=w(u,r,{maximumTokenCommitmentLength:40});if(k!==!0&&h>0)throw k;let l=this.vm.verify({sourceOutputs:r,transaction:u});if(typeof l=="string")throw Error(l);let m=E(r)-E(u.outputs);m>5e3&&(l=`Excessive fees ${m}`),p(r,a)==0n&&(l="Error checking token input");let O=p(r,a)-p(u.outputs,a);if(O!==0n)throw Error(`Claiming should not create destroy tokens, token difference: ${O}`);return{sourceOutputs:r,transaction:u,verify:l}}}export{I as B,$ as a,W as t};
//# sourceMappingURL=COsE9KFn.js.map
