import test from 'ava';


import BadgerStake from "../index.js";


test('test BadgerStake covenant address', t => {

    t.is(BadgerStake.getAddress(), "bitcoincash:rvgcl3xk6nwqlngkk09e7g67x5vxs57jv6v2q4qm4ct5yv4d3ppfgdzhpuxn8")
    t.is(BadgerStake.getAddress("bchreg"), "bchreg:rvgcl3xk6nwqlngkk09e7g67x5vxs57jv6v2q4qm4ct5yv4d3ppfgm054rz3a")
    t.is(BadgerStake.getAddress("bchtest"), "bchtest:rvgcl3xk6nwqlngkk09e7g67x5vxs57jv6v2q4qm4ct5yv4d3ppfgw9xly4x4")

});
