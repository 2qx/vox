// 

import test from 'ava';


import CatDex from "../index.js";


test('test CatDex covenant address', t => {

    t.is(CatDex.getAddress(
        "beef00000000000000000000000000000000000000000000000000000000beef",
        "7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c",
        "bchtest"
    ), "bchtest:rwj3q78smjl0gtchtx722pj7wx4hjgv5m7hyavzg3au2l06nfmsgw705zpu83")
    
});
