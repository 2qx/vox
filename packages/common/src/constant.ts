export const DEFAULT_CONCURRENCY = 8;

const REGTEST = '127.0.0.1'
const BLACKIE = 'blackie.c3-soft.com:64004'
const NINJA = 'chipnet.bch.ninja'
const BITJSON = 'chipnet.chaingraph.cash'
const U_NAME = 'chipnet.imaginary.cash'

export function getDefaultElectrum(isMainnet = true): string {
    return isMainnet ? 'bch.imaginary.cash' : NINJA
} 