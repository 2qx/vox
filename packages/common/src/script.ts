import {
    OpcodesBCH,
    encodeDataPush,
    encodeAuthenticationInstructions,
    decodeAuthenticationInstructions,
} from '@bitauth/libauth';

export const Op = OpcodesBCH;
export type Op = number;
export type OpOrData = Op | Uint8Array;
export type Script = OpOrData[];

export function scriptToBytecode(script: Script): Uint8Array {
    // Convert the script elements to AuthenticationInstructions
    const instructions = script.map((opOrData) => {
        if (typeof opOrData === 'number') {
            return { opcode: opOrData };
        }

        return decodeAuthenticationInstructions(encodeDataPush(opOrData))[0]!;
    });

    // Convert the AuthenticationInstructions to bytecode
    return encodeAuthenticationInstructions(instructions);
}