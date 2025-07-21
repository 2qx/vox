import test from 'ava';


import SmallIndex from "../index.js";


// Async arrow function
test('test small covenant address', async t => {

    t.is(SmallIndex.getAddress(""), "bitcoincash:rvhrra5p5kla6cg3uret9l8umkymdd646tr5wu5c99mtp38fyv37udtw0kr22")
    t.is(SmallIndex.getAddress("", "bchreg"), "bchreg:rvhrra5p5kla6cg3uret9l8umkymdd646tr5wu5c99mtp38fyv37umxdmf8gs")
    t.is(SmallIndex.getAddress("", "bchtest"), "bchtest:rvhrra5p5kla6cg3uret9l8umkymdd646tr5wu5c99mtp38fyv37uwvl3wslc")

});
