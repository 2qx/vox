import test from 'ava';

import Trust from "../index.js";


// Async arrow function
test('test trust address', async t => {

    const data = {
        recipient: "a914e78564d75c446f8c00c757a2bd783d30c4f0819a87",
    }

    t.is(
        // cspell:disable-next-line
        Trust.getAddress(data), "bitcoincash:p08h7d4f5vp6ataveke685rmm8fwg3u654a4j2urh9c65yc4jrxsyj2lenzgp"
    )

});
