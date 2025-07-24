import test from 'ava';

import { binToHex } from '@bitauth/libauth';
import Timeout from "../index.js";



// Async arrow function
test('test timeout address', t => {

    const data = {
        recipient: "a914e78564d75c446f8c00c757a2bd783d30c4f0819a87",
        timeout: 10,
        auth: "0000000000000000000000000000000000000000000000000000000000000000"
    }

    t.is(Timeout.getAddress(data), "bitcoincash:rwfmu83h5jgh33zhhqscdt6wwzv5elvt8n935w8nehyuxl06rv8dyz2axtpxf")
    t.is(Timeout.getAddress(data, "bchreg"), "bchreg:rwfmu83h5jgh33zhhqscdt6wwzv5elvt8n935w8nehyuxl06rv8dy587j59yn")
    t.is(Timeout.getAddress(data, "bchtest"), "bchtest:rwfmu83h5jgh33zhhqscdt6wwzv5elvt8n935w8nehyuxl06rv8dypdvcnjnm")


});

// Async arrow function
test('test cat serialized data address', t => {

    const data = {
        recipient: "a914e78564d75c446f8c00c757a2bd783d30c4f0819a87",
        timeout: 1000,
        auth: "0000000000000000000000000000000000000000000000000000000000000000"
    }

    let unlockScript = binToHex(Timeout.getUnlockingBytecode(data))
    let record = binToHex(Timeout.dataToCommitmentRecord(data))
    t.assert(unlockScript.indexOf(record)>1)

});
