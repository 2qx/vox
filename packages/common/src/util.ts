import {
  binToHex,
  CashAddressType,
  cashAddressTypeBitsToType,
  decodeCashAddressFormat,
  decodeCashAddressFormatWithoutPrefix,
  decodeCashAddressVersionByte,
  encodeTransactionBCH,
  // hexToBin,
  // CompilerBCH,
  // generateTransaction,
  // InputTemplate,
  lockingBytecodeToCashAddress,
  CashAddressNetworkPrefix,
  // OutputTemplate,
  sha256,
  swapEndianness,
  Transaction,
} from '@bitauth/libauth';

import { UtxoI } from './types.js';

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


export function sumUtxoValue(utxos: UtxoI[]) {
  if (utxos.length > 0) {
    const balanceArray: number[] = utxos.map((o: UtxoI) => {
      return o.value;
    });
    const balance = balanceArray.reduce((a: number, b: number) => a + b, 0);
    return balance;
  } else {
    return 0;
  }
}

export function sumTokenAmounts(utxos: UtxoI[], tokenId: string): bigint {
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


export function getTransactionFees(tx: Transaction, rate = 1): bigint {
  return BigInt(encodeTransactionBCH(tx).length * rate)
}

export function adjustTransactionFees(tx: Transaction, outputIdx: number, rate = 1) {
  const estimatedFee = getTransactionFees(tx, rate);
  tx.outputs[outputIdx]!.valueSatoshis = tx.outputs[outputIdx]!.valueSatoshis - estimatedFee
  return tx
}