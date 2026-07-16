import test from 'ava';
import { binToHex, hexToBin } from '@bitauth/libauth';
import Trust from "../index.js";


// Async arrow function
test('test trust address', async t => {

    const data = {
        recipient: "a914e78564d75c446f8c00c757a2bd783d30c4f0819a87",
    }

    let bytecode = Trust.dataToBytecode(data)

    t.is(
                binToHex(Trust.getLockingBytecode(bytecode)), "0355335017a914e78564d75c446f8c00c757a2bd783d30c4f0819a87c2529d51b275c0cd88c0ccc0c6016496a269c0c39376cdc0c788ccc0c602ab269502102796a2697551"
    );
    let record = Trust.encodeCommitment(data)
    t.is(
        // cspell:disable-next-line
        Trust.getScriptHash(record), "eb0acb1cb80b6a4596aafc7d94b3b68a261b3563c4743e047f8641c298778b3f"
    )

    
});
