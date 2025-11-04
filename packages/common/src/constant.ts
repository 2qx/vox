export const DEFAULT_CONCURRENCY = 8;

const REGTEST = '127.0.0.1'
const CHIPNET_BLACKIE = 'blackie.c3-soft.com:64004'
const CHIPNET_NINJA = 'chipnet.bch.ninja'
const CHIPNET_BITJSON = 'chipnet.chaingraph.cash'
const CHIPNET_U_NAME = 'chipnet.imaginary.cash'

export function getDefaultElectrum(isMainnet = true): string {
    return isMainnet ? 'bch.imaginary.cash' : CHIPNET_NINJA
} 