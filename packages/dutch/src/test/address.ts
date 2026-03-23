import test from 'ava';

import Dutch from "../index.js";


// Async arrow function
test('test dutch action address', async t => {

    const data = {
        open: 10_000_000_000,
        recipient: "a914e78564d75c446f8c00c757a2bd783d30c4f0819a87",
    }
    
    t.is(
        // cspell:disable-next-line
        Dutch.getAddress(data), "bitcoincash:r0v6p673hknf38093g20cnerr39yz2axp0hcqul3c6l8q594qg4kjr0km8de2"
    )

});
