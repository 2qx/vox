// https://github.com/bitcoin/bips/blob/master/bip-0021.mediawiki
// https://github.com/bitpay/jsonPaymentProtocol/blob/master/v2/specification.md
// https://github.com/bitjson/chip-paypro
import { isTokenaddr } from "./util.js"

// bitcoin:<address>[?amount=<amount>][?label=<label>][?message=<message>]


export function decode(uriString: string, check = true) {

    const uri = new URL(uriString)

    let protocol = uri.protocol

    if (protocol.slice(-1) == ":") protocol = protocol.slice(0, -1)

    if (protocol !== 'bitcoincash' && protocol !== 'bitcoin') {
        throw new Error("unknown protocol: " + protocol)
    }

    const address = uri.pathname
    
    if (check) {
        if (!address && !("r" in uri.searchParams.keys())) throw new Error("No address or request URL is provided.")
        if (address && "r" in uri.searchParams.keys()) throw new Error("Cannot specify a link and address")
        if (uri.searchParams.getAll("amount").length > 1) throw new Error("Request includes multiple instances of the `amount` parameter.")
        if (uri.searchParams.getAll("s").length > 1) throw new Error("Request includes multiple instances of the `s` parameter.")
        if (uri.searchParams.getAll("r").length > 1) throw new Error("Request includes multiple instances of the `r` parameter.")
        if (uri.searchParams.getAll("f").length > 1) throw new Error("Request includes multiple instances of the `f` parameter.")
        if (uri.searchParams.get("s") && uri.searchParams.get("amount")) throw new Error("Both `s` and `amount` are set.")
        if (uri.searchParams.get("e") && uri.searchParams.get("amount")) throw new Error("Expiring request uses the deprecated `amount` parameter.")
        if (uri.searchParams.get("m") && uri.searchParams.get("message")) throw new Error("Both `m` and `message` are set.")
        if (uri.searchParams.getAll("t").length == 1 && !isTokenaddr(address)) throw new Error("Token-accepting request requires a token-aware address.")
        if ((uri.searchParams.get("c") || uri.searchParams.get("f")) && !isTokenaddr(address)) throw new Error("Token request pays to an address without token support.")
        if ((uri.searchParams.get("n") || uri.searchParams.get("f")) && !(uri.searchParams.get("c"))) throw new Error("Token request is missing a token category.")
        if (uri.searchParams.getAll("t").length == 1 && !(uri.searchParams.get("c"))) throw new Error("Token request is missing a token category.")
    }


    const options = Object.fromEntries(uri.searchParams);
    return { address, options }

}


export function encode(urnScheme: string, options: URLSearchParams, address?: string) {

    options = options || {}

    const scheme = urnScheme || 'bitcoin'

    const query = new URLSearchParams(options).toString()

    return scheme + ':' + address + (query ? '?' : '') + query

}