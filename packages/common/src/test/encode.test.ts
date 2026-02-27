import test from 'ava';
import { hexToBin, utf8ToBin } from '@bitauth/libauth';
import {
    decodePushBytes,
    encodePushBytes,
    decodePushByte,
    encodePushByte
} from "../encode.js"


const prefixDataPushVectors = [
    ['', '00'],
    ['81', '4f'],
    ['01', '51'],
    ['02', '52'],
    ['03', '53'],
    ['04', '54'],
    ['05', '55'],
    ['06', '56'],
    ['07', '57'],
    ['08', '58'],
    ['09', '59'],
    ['0a', '5a'],
    ['0b', '5b'],
    ['0c', '5c'],
    ['0d', '5d'],
    ['0e', '5e'],
    ['0f', '5f'],
    ['10', '60'],
    ['00', '0100'],
    ['0000', '020000'],
    ['80', '0180'],
    ['0081', '020081'],
    ['123456', '03123456'],
    ['123456789012345678901234567890', '0f123456789012345678901234567890'],
    ['42'.repeat(128), '4c80' + '42'.repeat(128)],
    ['42'.repeat(512), '4d0002' + '42'.repeat(512)],
    ['42'.repeat(70000), '4e70110100' + '42'.repeat(70000)],
] as const;


test("Test decoding pushbyte data", (t) => {
    prefixDataPushVectors.forEach(([inputHex, outputHex]) => {
        t.deepEqual(decodePushByte(hexToBin(outputHex))[0], hexToBin(inputHex));
    });
})


test("Test encoding pushbyte data", (t) => {
    prefixDataPushVectors.forEach(([inputHex, outputHex]) => {
        t.deepEqual(encodePushByte(hexToBin(inputHex)), hexToBin(outputHex));
    });
})

test("Test decoding pushbyte array", (t) => {
    t.deepEqual(decodePushBytes("515657"), [1, 6, 7].map(h => Uint8Array.of(h)))
    t.deepEqual(decodePushBytes("010002000"), ["00", "0000"].map(h => hexToBin(h)))
})


test("Test encoding pushbyte array", (t) => {
    t.deepEqual(encodePushBytes([1, 6, 7].map(h => Uint8Array.of(h))), hexToBin("515657"))
    t.deepEqual(encodePushBytes(["00", "0000"]), hexToBin("010002000"))
})
