import {
    binToNumberUintLE,
    binToNumberUint16LE,
    binToNumberUint32LE,
    numberToBinUint16LE,
    numberToBinUint32LE,
    hexToBin
} from "@bitauth/libauth"
import {
    PushOperationConstants
} from "./enum.js"

import {
    catUint8
} from "./util.js"

export function decodePushByte(data: Uint8Array | string): [Uint8Array, number] {

    if (typeof data === "string") data = hexToBin(data);
    if (data.length == 0) {
        return [Uint8Array.of(0), 0];
    }
    const radix = data[0]!
    if (radix === 0) {
        return [Uint8Array.from([]), 1]
    }
    else if (radix >= PushOperationConstants.pushNumberOpcodesOffset
        && radix <= PushOperationConstants.pushNumberOpcodesOffset + PushOperationConstants.pushNumberOpcodes) {
        return [Uint8Array.of(radix - PushOperationConstants.pushNumberOpcodesOffset,), 1];
    } else if (radix === PushOperationConstants.OP_1NEGATE) {
        return [Uint8Array.of(PushOperationConstants.negativeOne), 1];
    }
    else {
        let len, start
        if (radix === PushOperationConstants.OP_PUSHDATA_1) {
            start = 2
            len = binToNumberUintLE(data.slice(1, start))
        }
        else if (radix === PushOperationConstants.OP_PUSHDATA_2) {
            start = 3
            len = binToNumberUint16LE(data.slice(1, start))
        }
        else if (radix === PushOperationConstants.OP_PUSHDATA_4) {
            start = 5;
            len = binToNumberUint32LE(data.slice(1, start))
        }
        else {
            start = 1;
            len = data[0]!;
        }
        const end = start + len;
        return [Uint8Array.from(data.slice(start, end)), end];
    }

}


export function encodePushByte(data: Uint8Array|string): Uint8Array {
    if (typeof data === "string") data = hexToBin(data);
    if (data.length <= PushOperationConstants.maximumPushByteOperationSize) {
        if (data.length === 0) {
            return Uint8Array.of(0);
        } else {
            if (data.length === 1) {
                if (data[0] !== 0 && data[0]! <= PushOperationConstants.pushNumberOpcodes) {
                    return Uint8Array.of(data[0]! + PushOperationConstants.pushNumberOpcodesOffset,);
                } else {
                    if (data[0] === PushOperationConstants.negativeOne) {
                        return Uint8Array.of(PushOperationConstants.OP_1NEGATE);
                    } else {
                        return Uint8Array.from([1, ...data]);
                    };
                };
            } else {
                return Uint8Array.from([data.length, ...data]);
            };
        };
    } else {
        if (data.length <= PushOperationConstants.maximumPushData1Size) {
            return Uint8Array.from([
                PushOperationConstants.OP_PUSHDATA_1,
                data.length,
                ...data,
            ]);
        } else {
            if (data.length <= PushOperationConstants.maximumPushData2Size) {
                return Uint8Array.from([
                    PushOperationConstants.OP_PUSHDATA_2,
                    ...numberToBinUint16LE(data.length),
                    ...data,
                ]);
            } else {
                return Uint8Array.from([
                    PushOperationConstants.OP_PUSHDATA_4,
                    ...numberToBinUint32LE(data.length),
                    ...data,
                ]);;
            };
        };
    }
}

export function decodePushBytes(data: Uint8Array | string): Uint8Array[] {
    if (typeof data === "string") data = hexToBin(data);
    let cursor = 0;
    let result = [];
    while (cursor < data.length) {
        const tmp = decodePushByte(data.slice(cursor))
        result.push(tmp[0])
        cursor += tmp[1]
    }
    return result
}

export function encodePushBytes(data: Uint8Array[] | string[]): Uint8Array {
    const encodedChunks = data.map((d: Uint8Array|string) => { return encodePushByte(d) })
    return catUint8(encodedChunks)
}