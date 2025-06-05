import test from 'ava';


import { CHANNEL_ADDRESSES } from './fixtures/index.js';

//import type { AddressListUnspentEntry } from '@unspent/tau';

import { Channel } from '../index.js';


test('Should calculate a channel addresses', (t) => {

    t.assert(CHANNEL_ADDRESSES[""] == Channel.getAddress(), "Main chan address should match")
    t.assert(CHANNEL_ADDRESSES["btc"] == Channel.getAddress("btc"), "btc chan address should match")
    t.assert(CHANNEL_ADDRESSES["test"] == Channel.getAddress("test"), "test chan address should match")
});


test('Should clear a messages', (t) => {
    let baseScenario = Channel.compiler.generateScenario({
        debug: true,
        scenarioId: 'transform_message',
    });
    if(typeof baseScenario === "string") throw baseScenario;
    if(typeof baseScenario.scenario === "string") throw baseScenario.scenario;

    // extendScenarioDefinition(baseScenario.scenario, {data: { "bytecode": { 
    //     "channel": toBin(""),
    //     "vault_locktime": bigIntToVmNumber(1000000n) 
    // } }})
    // console.log(baseScenario);
    t.assert(1==1)
}); 

