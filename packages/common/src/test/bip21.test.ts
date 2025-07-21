
import test from 'ava';


import { vectors, error_vectors } from './fixtures/bip21.fixtures.js';

import { decode } from "../bip21.js";


// for (const vector of vectors) {
//     test.skip(vector.description, (t) => {
//         let result = decode(vector.uri)
//         t.deepEqual(vector.params, result.options)
//     });
// }


// for (const vector of error_vectors) {
//     test.skip("Should throw: " + vector.error + " " + vector.uri, (t) => {
//         t.throws(
//             () => {
//                 decode(vector.uri)
//             },
//             { message: vector.error },
//         );

//     });
// }