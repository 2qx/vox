import {
    binToHex,
    CashAddressType,
    cashAddressTypeBitsToType,
    decodeCashAddressFormat,
    decodeCashAddressFormatWithoutPrefix,
    decodeCashAddressVersionByte,
    // hexToBin,
    // CompilerBCH,
    // generateTransaction,
    // InputTemplate,
    lockingBytecodeToCashAddress,
    CashAddressNetworkPrefix,
    // OutputTemplate,
    sha256,
    swapEndianness,
} from '@bitauth/libauth';

export function getScriptHash(lockingBytecode: Uint8Array, reversed = true): string {
    let hashHex = binToHex(sha256.hash(lockingBytecode))
    if (reversed) return swapEndianness(hashHex)
    return hashHex
}


export function getAddress(lockingBytecode: Uint8Array, prefix = "bitcoincash" as CashAddressNetworkPrefix): string {
    const bytecode = lockingBytecode
    const result = lockingBytecodeToCashAddress({ prefix: prefix, bytecode: bytecode, tokenSupport: false })
    if (typeof result === 'string') throw (result)
    return result.address
}

export function isTokenaddr(address: string): boolean {
  let result:
    | string
    | { payload: Uint8Array; prefix: string; version: number }
    | undefined;

  // If the address has a prefix decode it as is
  if (address.includes(":")) {
    result = decodeCashAddressFormat(address);
  } else {
    // otherwise, derive the network from the address without prefix
    result = decodeCashAddressFormatWithoutPrefix(address);
  }

  if (typeof result === "string") throw new Error(result);

  const info = decodeCashAddressVersionByte(result.version);
  if (typeof info === "string") throw new Error(info);

  const type = cashAddressTypeBitsToType[
    info.typeBits as keyof typeof cashAddressTypeBitsToType
  ] as CashAddressType | undefined;
  if (type === undefined) {
    throw Error("Wrong cashaddress type");
  }

  return (
    [CashAddressType.p2pkhWithTokens, CashAddressType.p2shWithTokens].indexOf(
      type
    ) !== -1
  );
}

export function checkTokenaddr(cashaddr: string, enforce: boolean) {
  if (enforce && !isTokenaddr(cashaddr)) {
    throw new Error("Error trying to send to a non-tokenaware cash address");
  }
}