import test from 'ava';


import Locktime from "../index.js";


// Async arrow function
test('test locktime address', async t => {

    const data = {
        locktime: 10,
        recipient: "a914e78564d75c446f8c00c757a2bd783d30c4f0819a87"
    }
    t.is(Locktime.getAddress(data), "bitcoincash:rvlxys9mz8nkrlw5dd75794h9vlpt7wws839mnej5yfqk9qpuml9gn7xnxa8v")

});
