import test from 'ava';
import { binToHex } from "@bitauth/libauth";

import Locktime from "../index.js";


// Async arrow function
test('test locktime address', async t => {

    const data = {
        locktime: 10,
        recipient: "a914e78564d75c446f8c00c757a2bd783d30c4f0819a87"
    }
    let bytecode = Locktime.dataToBytecode(data)

    // cspell:disable-next-line
    t.is(
        binToHex(Locktime.getLockingBytecode(bytecode)), "0355334c17a914e78564d75c446f8c00c757a2bd783d30c4f0819a875ac2529db175c0cd88c0ccc0c602c40994a269c0d3c0d09dc0d1c0ce88c0d2c0cf8777"
    )

});
