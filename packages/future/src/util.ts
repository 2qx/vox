import { 
    hexToBin, 
    utf8ToBin 
} from "@bitauth/libauth";

export function toBin(input?: string): Uint8Array {
    if(!input) return new Uint8Array(0);
    const data = input.replace(/^0x/, "");
    const encode = data === input ? utf8ToBin : hexToBin;
    return encode(data);
}