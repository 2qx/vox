import test from 'ava';
import { binToHex, hexToBin } from '@bitauth/libauth';
import Trust from "../index.js";


// Async arrow function
test('test trust address', async t => {

    const data = {
        recipient: "a914e78564d75c446f8c00c757a2bd783d30c4f0819a87",
    }

    let bytecode = Trust.dataToBytecode(data)
    let record = Trust.asRecord(hexToBin(data.recipient))
    t.is(
                binToHex(Trust.getLockingBytecode(bytecode)), "17a914e78564d75c446f8c00c757a2bd783d30c4f0819a87c2529d51b275c0cd88c0ccc0c6016496a269c0c39376cdc0c788ccc0c602ab269502102796a26951"
    );
    t.is(
        // cspell:disable-next-line
        Trust.getScriptHash(record), "ed2a092adcbcea47d5d03371beeb3adbb75e8557e6be9ad237a7ea89cad34467"
    )

});
