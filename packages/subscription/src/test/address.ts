import test from 'ava';

import Subscription from "../index.js";


// Async arrow function
test('test subscription address', async t => {

    const data = {
        installment: 1000,
        recipient: "a914e78564d75c446f8c00c757a2bd783d30c4f0819a87",
        period: 144,
        auth: "0000000000000000000000000000000000000000000000000000000000000000"
    }


    t.is(
        Subscription.getAddress(data), "bitcoincash:rvsyyughrl5dn2vn76qjna7pyayj2rzsa0gkt8xve6ff47cva8ptkm40nlv54"
    )

});
