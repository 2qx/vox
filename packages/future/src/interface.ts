import { UtxoI } from "@unspent/tau";

export interface rateSet {
    spb: number;
    ytm: number;
    ypa: number;
}

export interface rateSetLocale {
    spb: string;
    ytm: string;
    ypa: string;
}


export interface CouponDataI {
    locktime: number;
    placement: number;
    scripthash: string;
    lockingBytecode: string;
}

export interface CouponItemI {
    id: string;
    scripthash: string;
    utxo: UtxoI;
    spb?: number;
    ytm?: number;
    ypa?: number;
    locale?: rateSetLocale;
    locktime?: number;
    placement?: number;
    lockingBytecode?: string;
    dateLocale?: string;
}