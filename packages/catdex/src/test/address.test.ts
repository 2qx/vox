// 

import test from 'ava';


import CatDex from "../index.js";


test('test CatDex covenant address', t => {

    t.is(CatDex.getAddress(
        "beef00000000000000000000000000000000000000000000000000000000beef",
        "7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c",
        "bchtest"
    ), "bchtest:rvpmcx30w03zd3kz7fqrs83cxsc66pm9gf9xj8t2q88r40j3aphmgzn9z7hdm")
    
    // "bchtest:rwar8x8srls7ak7m6fytdvuwpmkxkur9rylwsvmtf4d2tmms4k7vjzd5yuf4u"

});
