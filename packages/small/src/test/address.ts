import test from 'ava';


import SmallIndex from "../index.js";
import { hexToBin } from 'mainnet-js';


// Async arrow function
test('test small covenant address', async t => {

    t.is(SmallIndex.getAddress(""), "bitcoincash:rvhrra5p5kla6cg3uret9l8umkymdd646tr5wu5c99mtp38fyv37udtw0kr22")
    t.is(SmallIndex.getAddress("test"), "bitcoincash:rv4nnrazuszrn8qqn6dexjtfdh23n4pkgtngx9arsz47xrmdqrx55pprjkxl9")
    
    t.is(SmallIndex.getAddress("74657374"), "bitcoincash:rv4nnrazuszrn8qqn6dexjtfdh23n4pkgtngx9arsz47xrmdqrx55pprjkxl9")
    t.is(SmallIndex.getAddress("7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c"), "bitcoincash:r0rcsje6wcwm4ujp3lvq02qs50ahmujs3w792atj5tcpqh0dwexlgsw79kxma")
    t.is(SmallIndex.getAddress(hexToBin("7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c")), "bitcoincash:r0rcsje6wcwm4ujp3lvq02qs50ahmujs3w792atj5tcpqh0dwexlgsw79kxma")
    t.is(SmallIndex.getAddress("", "bchreg"), "bchreg:rvhrra5p5kla6cg3uret9l8umkymdd646tr5wu5c99mtp38fyv37umxdmf8gs")
    t.is(SmallIndex.getAddress("", "bchtest"), "bchtest:rvhrra5p5kla6cg3uret9l8umkymdd646tr5wu5c99mtp38fyv37uwvl3wslc")

});
