import test from 'ava';
import { hexToBin } from "@bitauth/libauth";
import Subscription from "../index.js";


// Async arrow function
test.skip('test subscription address', async t => {

    const data = {
        installment: 1000n,
        recipient: hexToBin("a914e78564d75c446f8c00c757a2bd783d30c4f0819a87"),
        period: 144,
        auth: hexToBin("0000000000000000000000000000000000000000000000000000000000000000")
    }

    
    t.is(
        // cspell:disable-next-line
        Subscription.getAddress(data), "bitcoincash:rwe40x9uq9scxdpm7jlpdrx9yl460u92mae5jarnxm7ylqxxxrzmzcp88als5"
    )

});
