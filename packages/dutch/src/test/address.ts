import test from 'ava';
import { binToHex } from '@bitauth/libauth';
import Dutch from "../index.js";


// Async arrow function
test('test dutch auction address', async t => {

    const data = {
        open: 10_000_000_000,
        recipient: "a914e78564d75c446f8c00c757a2bd783d30c4f0819a87",
    }
    const bytecodeData = Dutch.dataToBytecode(data)
    
    t.is(
        binToHex(Dutch.getLockingBytecode(bytecodeData)), 
        "03553341" +
        "17a914e78564d75c446f8c00c757a2bd783d30c4f0819a870500e40b5402c2529dc0cc9603ffff0078a069b275c0cd8777"
    )

});
