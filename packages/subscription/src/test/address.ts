import test from 'ava';
import { hexToBin, binToHex } from "@bitauth/libauth";
import Subscription from "../index.js";


// Async arrow function
test('test subscription address', async t => {

    const data = {
        installment: 1000n,
        recipient: hexToBin("a914e78564d75c446f8c00c757a2bd783d30c4f0819a87"),
        period: 144,
        auth: hexToBin("dead00000000000000000000000000000000000000000000000000000000beef")
    }

    let bytecodeData = Subscription.dataToBytecode(data)

    t.is(
        binToHex(Subscription.getLockingBytecode(bytecodeData)),
        "03553353" +
        "02e803" +
        "17a914e78564d75c446f8c00c757a2bd783d30c4f0819a87" +
        "029000" +
        "20efbe00000000000000000000000000000000000000000000000000000000adde" +
        "00ce7c527e876367c0d05379a16367c0c3937568686d757551"
    )

});
