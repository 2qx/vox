import{g as p,i as l,h as u,u as d,d as h,e as m,f as g,v as y}from"./BQUio51k.js";import{c as k}from"./DGwzT_kg.js";const f="https://libauth.org/schemas/wallet-template-v0.schema.json",O="Small Index: A distributed key-value database system.",T="SmallIndex",b={small_index_covenant:{description:`Store data records in NFT commitments. 

Each "key" corresponds to a different contract address, where the token balance stores the values for that key. Each record exists in the data commitment of a non-fungible token of any category (currently 40 bytes in length). Each record pays a flat storage fee of one satoshi per block. Expired records can be burned by anyone to benefit the party mining the next block.

 The Small Index covenant defines a storage mechanism, but the schema for data within the records is left to application designers. Since anyone may write to any record, applications must verify all claims, or use an authorization scheme to validate data.`,name:"Small Index Covenant",scripts:["unlock"],variables:{key:{description:"Bytes representing the key of the index. Each new key results in a new covenant address. ",name:"Key",type:"WalletData"}}}},v={drop:{data:{bytecode:{key:""}},description:"Drop a expired record value from the dataset. This spending pathway 'burns' token data as an return operation (OP_RETURN) output, and releases the satoshi value to be claimed by the party mining the next block.",name:"Record drop",transaction:{locktime:0,inputs:[{outpointTransactionHash:"0e09765ada34fa0bd94ef9df8497173e8aefc560f3eb7c9e0e88b345c4cccb36",outpointIndex:0,unlockingBytecode:["slot"],sequenceNumber:500}],outputs:[{lockingBytecode:{script:"op_return"}}],version:2},sourceOutputs:[{lockingBytecode:["slot"],valueSatoshis:500,token:{nft:{commitment:"0x6a<TST><'Hello World'>"}}}]}},E={unlock:{passes:["drop"],name:"Drop Record",script:`// Dropping a record is authorized 
// using only introspection from properties of 
// the expired record unspent output.`,timeLockType:"height",unlocks:"lock"},op_return:{lockingType:"standard",name:"Return Operation",script:"OP_RETURN"},lock:{lockingType:"p2sh32",name:"Small Index Locking Script",script:`// pragma cashscript 0.10.0;

// Small Index 
// 
// A subscription based key-value index 
//

// Including the key here creates a different covenant for each key-value
<key> OP_DROP
// contract SmallIndex(bytes key) {
    
    // Secure outputs with data in token commitments for a given key.
    // 
    // All entries pay a fixed storage fee of 1 satoshi per block. 
    //
    // If an entry has expired, miners may drop it.
    //
    // Miners can drop many expired entires at once.
    //

// function drop() {

// Require each input age be higher than the utxo value
    OP_INPUTINDEX OP_UTXOVALUE OP_CHECKSEQUENCEVERIFY OP_DROP
// require(tx.age >= tx.inputs[this.activeInputIndex].value);

// See TokenBurner - Dagur Valberg Johannsson
//
// Require a single output
   OP_TXOUTPUTCOUNT OP_1 OP_NUMEQUALVERIFY 
// require(tx.outputs.length == 1);

// Without BCH
   OP_0 OP_OUTPUTVALUE OP_0 OP_NUMEQUALVERIFY
// require(tx.outputs[0].value == 0);

// Without tokens
   OP_0 OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUALVERIFY
// require(tx.outputs[0].tokenCategory == 0x);

// As an empty OP_RETURN
   OP_0 OP_OUTPUTBYTECODE <0x6a> OP_EQUAL
// require(tx.outputs[0].lockingBytecode == 0x6a);

//    }
// }`}},_=["BCH_2023_05","BCH_SPEC"],I=0,P={$schema:f,description:O,name:T,entities:b,scenarios:v,scripts:E,supported:_,version:I},S="@unspent/small",x={name:S};class w{static USER_AGENT=x.name;static PROTOCOL_IDENTIFIER="U3R";static VERSION="1.0.0";static tokenAware=!0;static template=P;static compiler=p(this.template);static vm=k();static parseKey(t){return typeof t=="string"&&(l(t)?t=u(t):t=d(t)),t}static getLockingBytecode(t){const e=this.compiler.generateBytecode({data:{bytecode:{key:this.parseKey(t)}},scriptId:"lock"});if(!e.success)throw new Error("Failed to generate bytecode, script: , "+JSON.stringify(e,null,"  "));return e.bytecode}static getScriptHash(t,e=!0){return h(this.getLockingBytecode(t),e)}static getAddress(t,e="bitcoincash"){return m(this.getLockingBytecode(t),e,this.tokenAware)}static getSourceOutput(t,e){return{lockingBytecode:this.getLockingBytecode(t),valueSatoshis:BigInt(e.value)}}static getSourceOutputs(t,e){return e.map(n=>this.getSourceOutput(t,n))}static getInput(t,e){return{outpointIndex:e.tx_pos,outpointTransactionHash:u(e.tx_hash),sequenceNumber:e.value,unlockingBytecode:{data:{bytecode:{key:this.parseKey(t)}},compiler:this.compiler,script:"unlock",valueSatoshis:BigInt(e.value)}}}static getInputs(t,e){return e.map(n=>this.getInput(t,n))}static getOutput(){return{lockingBytecode:{data:{},compiler:this.compiler,script:"op_return"},valueSatoshis:BigInt(0)}}static drop(t,e){let s={locktime:0,version:2,inputs:[],outputs:[]};s.inputs.push(...this.getInputs(t,e)),s.outputs.push(this.getOutput());let a=g(s);if(!a.success)throw new Error("generate transaction failed!, errors: "+JSON.stringify(a.errors,null,"  "));const o=[...this.getSourceOutputs(t,e)],r=a.transaction,c=y(r,o,{maximumTokenCommitmentLength:40});if(c!==!0)throw c;let i=this.vm.verify({sourceOutputs:o,transaction:r});if(typeof i=="string")throw Error(i);return{sourceOutputs:o,transaction:r,verify:i}}}export{w as S};
//# sourceMappingURL=zv45hi4S.js.map
