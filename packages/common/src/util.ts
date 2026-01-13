import {
  bigIntToVmNumber,
  binToHex,
  CashAddressType,
  cashAddressTypeBitsToType,
  cashAssemblyToBin,
  CompilerBch,
  decodeCashAddressFormat,
  decodeCashAddressFormatWithoutPrefix,
  decodeCashAddressVersionByte,
  encodeTransactionBch,
  lockingBytecodeToCashAddress,
  Output,
  OutputTemplate,
  sha256,
  swapEndianness,
  Transaction,
} from '@bitauth/libauth';

import {
  UtxoI,
  type CashAddressNetworkPrefix
} from './types.js';

export function getScriptHash(lockingBytecode: Uint8Array, reversed = true): string {
  let hashHex = binToHex(sha256.hash(lockingBytecode))
  if (reversed) return swapEndianness(hashHex)
  return hashHex
}


export function getAddress(lockingBytecode: Uint8Array, prefix = "bitcoincash" as CashAddressNetworkPrefix, tokenSupport = false): string {
  const result = lockingBytecodeToCashAddress({ prefix: prefix, bytecode: lockingBytecode, tokenSupport: tokenSupport })
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


export function sumUtxoValue(utxos: UtxoI[], subTokenDust = false) {
  if (utxos.length > 0) {
    const balanceArray: number[] = utxos.map((o: UtxoI) => {
      return o.value;
    });
    const balance = balanceArray.reduce((a: number, b: number) => a + b - (subTokenDust ? 800 : 0), 0);
    return balance;
  } else {
    return 0;
  }
}

export function sumTokenAmounts(utxos: UtxoI[], tokenId: string): bigint {
  if (tokenId && typeof tokenId !== "string") tokenId = binToHex(tokenId)
  if (utxos.length > 0) {
    const tokenArray: (string | bigint)[] = utxos
      .filter((utxo) => utxo.token_data?.category === tokenId)
      .map((o: UtxoI) => {
        return o.token_data?.amount || 0n;
      });
    const balance = tokenArray.reduce((a: any, b: any) => BigInt(a) + BigInt(b), 0n);
    return BigInt(balance);
  } else {
    return 0n;
  }
}

export function sumSourceOutputValue(source: Output[], subTokenDust = false) {
  if (source.length > 0) {
    const balanceArray: bigint[] = source.map((o: Output) => {
      return o.valueSatoshis;
    });
    const balance = balanceArray.reduce((a: bigint, b: bigint) => a + b - (subTokenDust ? 800n : 0n), 0n);
    return balance;
  } else {
    return 0n;
  }
}

export function sumOutputValue(outputs: OutputTemplate<CompilerBch>[], subTokenDust = false) {
  if (outputs.length > 0) {
    const balanceArray: bigint[] = outputs.map((o: OutputTemplate<CompilerBch>) => {
      return o.valueSatoshis;
    });
    const balance = balanceArray.reduce((a: bigint, b: bigint) => a + b - (subTokenDust ? 800n : 0n), 0n);
    return balance;
  } else {
    return 0n;
  }
}

export function sumOutputTokenAmounts(
  outputs: OutputTemplate<CompilerBch>[],
  tokenId: string | Uint8Array) {
  if (tokenId && typeof tokenId !== "string") tokenId = binToHex(tokenId)
  if (outputs.length > 0) {
    const tokenArray: (string | bigint)[] = outputs
      .filter((o) => o.token && binToHex(o.token?.category) === tokenId)
      .map((o: OutputTemplate<CompilerBch>) => {
        return BigInt(o.token?.amount!) || 0n;
      });
    const balance = tokenArray.reduce((a: any, b: any) => BigInt(a) + BigInt(b), 0n);
    return BigInt(balance);
  } else {
    return 0n;
  }
}



export function sumSourceOutputTokenAmounts(source: Output[], tokenId?: string | Uint8Array): bigint {
  if (tokenId && typeof tokenId !== "string") tokenId = binToHex(tokenId)
  if (source.length > 0) {
    const tokenArray: (string | bigint)[] = source
      .filter((source) => source.token && binToHex(source.token?.category) === tokenId)
      .map((o: Output) => {
        return BigInt(o.token?.amount!) || 0n;
      });
    const balance = tokenArray.reduce((a: any, b: any) => BigInt(a) + BigInt(b), 0n);
    return BigInt(balance);
  } else {
    return 0n;
  }
}


export function getTransactionFees(tx: Transaction, rate = 1): bigint {
  return BigInt(encodeTransactionBch(tx).length * rate)
}


export function checkForEmptySeed(seed: Uint8Array) {
  let blankSeed =
    "4ed8d4b17698ddeaa1f1559f152f87b5d472f725ca86d341bd0276f1b61197e21dd5a391f9f5ed7340ff4d4513aab9cce44f9497a5e7ed85fd818876b6eb402e";
  let seedBin = new Uint8Array(seed);
  if (blankSeed == binToHex(seedBin))
    throw Error("Seed was generated using empty mnemonic");
}


export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))


export const numToVm = (n: number) => bigIntToVmNumber(BigInt(n))

export function cashAssemblyToHex(str: string): string {
  let result = cashAssemblyToBin(str)
  if (typeof result === "string") throw result
  return binToHex(result)
}

