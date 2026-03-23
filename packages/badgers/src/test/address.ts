import test from 'ava';


import BadgerStake from "../index.js";


test('test BadgerStake covenant address', t => {

    t.is(BadgerStake.getAddress(), "bitcoincash:rvgcl3xk6nwqlngkk09e7g67x5vxs57jv6v2q4qm4ct5yv4d3ppfgdzhpuxn8")
    t.is(BadgerStake.getAddress(
        "7003b9e854d2abc855b2c20c9734c3dfe4ec3a4de573f7ebb9ce1be527a5bb36", "bchtest"
    ), "bchtest:rwpakc5wxpj59yx70x70x3zul9r3cqtz2u9v4jjjv2k62de9ygl9zfkfpz7kv")

});


