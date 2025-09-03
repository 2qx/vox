import { 
    hexToBin, 
    utf8ToBin 
} from "@bitauth/libauth";

import {
    UtxoI,
    listUnspentWrap,
    promiseAllInBatches
} from "@unspent/tau";

import {
    rateSet,
    rateSetLocale,
    CouponItemI
} from "./interface.js";

export function toBin(input?: string): Uint8Array {
    if(!input) return new Uint8Array(0);
    const data = input.replace(/^0x/, "");
    const encode = data === input ? utf8ToBin : hexToBin;
    return encode(data);
}

export function getRates(
    currentBlock: number,
    futureBlock: number,
    coupon: number,
    principal = 1e8): rateSet {

    if (futureBlock <= currentBlock) {
        return {
            spb: Infinity,
            ytm: Infinity,
            ypa: Infinity
        }
    }

    // account for swap in fee
    coupon -= 870;
    return {
        spb: Math.round(Number((coupon / (futureBlock - currentBlock) / ((principal - coupon) / 1e8)) + Number.EPSILON) * 100) / 100,
        ytm: Number((coupon / (principal - coupon)) * 1e2),
        ypa: Number((coupon / (principal - coupon)) * 1e2 * (52596 / (futureBlock - currentBlock))),
    }

}

/**
     * Return rate information for a given coupon in a localized format
     *
     *
     * @param currentBlock - the current time, in blocks
     * @param futureBlock - the future time, in blocks
     * @param coupon - the coupon amount in satoshis
     * @param principal - amount required to claim coupon
     */

export function getRateLocale(
    currentBlock: number,
    futureBlock: number,
    coupon: number,
    principal = 1e8): rateSetLocale {

    let rates = getRates(
        currentBlock,
        futureBlock,
        coupon,
        principal);

    return {
        spb: rates.spb.toLocaleString(undefined, {
            maximumFractionDigits: 0,
            minimumFractionDigits: 0
        }),
        ytm: rates.ytm.toLocaleString(
            undefined,
            {
                maximumFractionDigits: 1,
                minimumFractionDigits: 1
            }
        ),
        ypa: rates.ypa.toLocaleString(
            undefined,
            {
                maximumFractionDigits: 1,
                minimumFractionDigits: 1
            }
        ),
    }
}


export function getFutureBlockDate(currentBlock: number, futureBlock: number): Date {
    const blocks = futureBlock - currentBlock
    var futureDate = new Date();
    //@ts-ignore
    futureDate.setTime(futureDate.getTime() + 6E5 * blocks);
    return futureDate
}

export function getFutureBlockDateLocale(currentBlock: number, futureBlock: number): string {
    var futureDate = getFutureBlockDate(currentBlock, futureBlock)
    let diff = futureBlock - currentBlock;
    let options = {}
    if (diff < 200) {
        options = {
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            hourCycle: 'h24'
        }
    }else if (diff < 1000) {
        options = {
            month: 'numeric',
            day: 'numeric',
        }
    } else if (diff > 200000) {
        options = {
            year: 'numeric'
        }
    }else if (diff > 50000) {
        options = {
            year: 'numeric',
            month: 'numeric'
        }
    } else {
        options = {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric'
        }
    }
    //@ts-ignore
    return new Intl.DateTimeFormat(undefined, options).format(futureDate);
}

export async function getAllUnspentCoupons(electrumClient:any, scriptHashes:string[]): Promise<Map<string, UtxoI>> {
    let allUnspent = (await promiseAllInBatches(listUnspentWrap, scriptHashes.map(a => [electrumClient, a]))).flat()
    var map = new Map();
    allUnspent.map((obj:UtxoI) => map.set(obj.tx_hash + ":" + obj.tx_pos, obj));
    return map as Map<string, any>
}

