export const vectors = [
    {
        description: "v0 address",
        params: {},
        uri: `bitcoincash:qr7fzmep8g7h7ymfxy74lgc0v950j3r2959lhtxxsl`
    },
    {
        description: "v0 address, token support",
        params: { t: '' },
        uri: `bitcoincash:qr7fzmep8g7h7ymfxy74lgc0v950j3r2959lhtxxsl?t`
    },
    {
        description: "v0 address, token support, web-safe URI",
        params: { t: '' },
        uri: `bitcoin:qr7fzmep8g7h7ymfxy74lgc0v950j3r2959lhtxxsl?t`
    },
    {
        description: "v0 address, token support, backwards-compatible message",
        params: { t: '', message: 'test' },
        uri: `bitcoincash:qr7fzmep8g7h7ymfxy74lgc0v950j3r2959lhtxxsl?t&message=test`
    },
    {
        description: "v0 address, token support, message",
        params: { t: '', m: 'Tip for Alice at Venue' },
        uri: `bitcoincash:qr7fzmep8g7h7ymfxy74lgc0v950j3r2959lhtxxsl?t&m=%54ip%20for%20%41lice%20at%20%56enue`
    },
    {
        description: "v0 address, token support, message, expiration",
        params: {
            t: "", m: "Tip for Bob at Venue", e: '1668513600'
        },
        uri: `bitcoincash:qr7fzmep8g7h7ymfxy74lgc0v950j3r2959lhtxxsl?t&e=1668513600&m=%54ip%20for%20%42ob%20at%20%56enue`
    },
    {
        description: "v2 address (implicit token support)",
        params: {},
        uri: `bitcoincash:zr7fzmep8g7h7ymfxy74lgc0v950j3r295z4y4gq0v`
    },
    {
        description: "v2 address (implicit token support), web-safe URI",
        params: {},
        uri: `bitcoin:zr7fzmep8g7h7ymfxy74lgc0v950j3r295z4y4gq0v`
    },
    {
        description: "v2 address, satoshis",
        params: { s: '123456' },
        uri: `bitcoincash:zr7fzmep8g7h7ymfxy74lgc0v950j3r295z4y4gq0v?s=123456`
    },
    {
        description: "v0 address, satoshis, expiration",
        params: { s: '123400', e: '1684152000' },
        uri: `bitcoincash:qr7fzmep8g7h7ymfxy74lgc0v950j3r2959lhtxxsl?s=123400&e=1684152000`
    },
    {
        description: "Payment Protocol-Only",
        params: { r: 'example.com/pay/1234' },
        uri: `bitcoincash:?r=example.com/pay/1234`
    },
    {
        description: "Payment Protocol-Only, web-safe URI",
        params: { r: 'example.com/pay/1234' },
        uri: `bitcoin:?r=example.com/pay/1234`
    },
    {
        description: "Payment Protocol; falls back to v0 address, BIP21 amount",
        params: { r: 'example.com/pay/1234', amount: '.001234' },
        uri: `bitcoincash:qr7fzmep8g7h7ymfxy74lgc0v950j3r2959lhtxxsl?amount=.001234&r=example.com/pay/1234`
    },
    {
        description: "Payment Protocol; falls back to v0 address, satoshis, and expiration",
        params: { r: "example.com/pay/1234", s: '123400', e: '1684152000' },
        uri: `bitcoincash:qr7fzmep8g7h7ymfxy74lgc0v950j3r2959lhtxxsl?s=123400&e=1684152000&r=example.com/pay/1234`
    },
    {
        description: "Payment Protocol; falls back to v0 address, token support, message",
        params: { r: "example.com/tip/1234", t: '', m: 'Tip for Bob, Venue' },
        uri: `bitcoincash:qr7fzmep8g7h7ymfxy74lgc0v950j3r2959lhtxxsl?r=example.com/tip/1234&t&m=%54ip%20for%20%42ob%2C%20%56enue`
    },
    {
        description: "v0 address, BIP21-compatible amount and message",
        params: { amount: '1', message: 'Test at ACME (10% Friends & Family Discount)' },
        uri: `bitcoincash:qr7fzmep8g7h7ymfxy74lgc0v950j3r2959lhtxxsl?amount=1&message=%54est%20at%20%41%43%4D%45%20%2810%25%20%46riends%20%26%20%46amily%20%44iscount%29`
    },
    {
        description: "v0 address, satoshi amount and message",
        params: { s: '12345', m: 'Multi\nLine\nMessage: T̶̀est' },
        uri: `bitcoincash:qr7fzmep8g7h7ymfxy74lgc0v950j3r2959lhtxxsl?s=12345&m=%4Dulti%0A%4Cine%0A%4Dessage%3A%20%54%CD%80%CC%B6est`
    },
    {
        description: "v2 address, 10,000 FT request, minimum satoshis",
        params: { c: "0afd5f9ad130d043f627fad3b422ab17cfb5ff0fc69e4782eea7bd0853948428", f: '10000' },
        uri: `bitcoincash:zr7fzmep8g7h7ymfxy74lgc0v950j3r295z4y4gq0v?c=0afd5f9ad130d043f627fad3b422ab17cfb5ff0fc69e4782eea7bd0853948428&f=10000`
    },
    {
        description: "v2 address, 10,000 FT request, 1000 satoshis",
        params: { c: "0afd5f9ad130d043f627fad3b422ab17cfb5ff0fc69e4782eea7bd0853948428", f: '10000', s: '1000' },
        uri: `bitcoincash:zr7fzmep8g7h7ymfxy74lgc0v950j3r295z4y4gq0v?c=0afd5f9ad130d043f627fad3b422ab17cfb5ff0fc69e4782eea7bd0853948428&f=10000&s=1000`
    },
    {
        description: "v2 address, 10,000 FT request, zero-byte NFT, minimum satoshis",
        params: { c: "0afd5f9ad130d043f627fad3b422ab17cfb5ff0fc69e4782eea7bd0853948428", f: '10000', n: '' },
        uri: `bitcoincash:zr7fzmep8g7h7ymfxy74lgc0v950j3r295z4y4gq0v?c=0afd5f9ad130d043f627fad3b422ab17cfb5ff0fc69e4782eea7bd0853948428&f=10000&n`
    },
    {
        description: "v2 address, 10,000 FT request, zero-byte NFT, 1000 satoshis",
        params: { c: "0afd5f9ad130d043f627fad3b422ab17cfb5ff0fc69e4782eea7bd0853948428", f: '10000', n: '', s: '1000' },
        uri: `bitcoincash:zr7fzmep8g7h7ymfxy74lgc0v950j3r295z4y4gq0v?c=0afd5f9ad130d043f627fad3b422ab17cfb5ff0fc69e4782eea7bd0853948428&f=10000&n&s=1000`
    },
    {
        description: "v2 address, NFT commitment, minimum satoshis",
        params: { c: `0afd5f9ad130d043f627fad3b422ab17cfb5ff0fc69e4782eea7bd0853948428`, n: `01` },
        uri: `bitcoincash:zr7fzmep8g7h7ymfxy74lgc0v950j3r295z4y4gq0v?c=0afd5f9ad130d043f627fad3b422ab17cfb5ff0fc69e4782eea7bd0853948428&&n=01`
    },
    {
        description: "v0 address, unknown optional parameter",
        params: { custom: 'value' },
        uri: `bitcoincash:zr7fzmep8g7h7ymfxy74lgc0v950j3r295z4y4gq0v?custom=value`
    }
]

export const error_vectors = [
    {
        error: "No address or request URL is provided.",
        uri: `bitcoincash:?amount=1`
    },
    {
        error: "No address or request URL is provided.",
        uri: `bitcoincash:?s=1000`
    },
    {
        error: "Request includes multiple instances of the `amount` parameter.",
        uri: `bitcoincash:qr7fzmep8g7h7ymfxy74lgc0v950j3r2959lhtxxsl?amount=1&amount=1`
    },
    {
        error: "Request includes multiple instances of the `r` parameter.",
        uri: `bitcoincash:?r&r=example.com/pay/1234`
    },
    {
        error: "Request includes multiple instances of the `s` parameter.",
        uri: `bitcoincash:qr7fzmep8g7h7ymfxy74lgc0v950j3r2959lhtxxsl?s=123456&s=123456`
    },
    {
        error: "Request includes multiple instances of the `f` parameter.",
        uri: `bitcoincash:zr7fzmep8g7h7ymfxy74lgc0v950j3r295z4y4gq0v?c=0afd5f9ad130d043f627fad3b422ab17cfb5ff0fc69e4782eea7bd0853948428&f=10000&f=1`
    },
    {
        error: "Token-accepting request requires a token-aware address.",
        uri: `bitcoincash:qr7fzmep8g7h7ymfxy74lgc0v950j3r2959lhtxxsl?t&amount=1`
    },
    {
        error: "Token-accepting request requires a token-aware address.",
        uri: `bitcoincash:qr7fzmep8g7h7ymfxy74lgc0v950j3r2959lhtxxsl?t&s=1000`
    },
    {
        error: "Token-accepting request requires a token-aware address.",
        uri: `bitcoincash:qr7fzmep8g7h7ymfxy74lgc0v950j3r2959lhtxxsl?t&c=0afd5f9ad130d043f627fad3b422ab17cfb5ff0fc69e4782eea7bd0853948428&f=10000`
    },
    {
        error: "Expiring request uses the deprecated `amount` parameter.",
        uri: `bitcoincash:qr7fzmep8g7h7ymfxy74lgc0v950j3r2959lhtxxsl?amount=1&e=1684152000`
    },
    {
        error: "Both `s` and `amount` are set.",
        uri: `bitcoincash:qr7fzmep8g7h7ymfxy74lgc0v950j3r2959lhtxxsl?s=123456&amount=.00123456`
    },
    {
        error: "Both `m` and `message` are set.",
        uri: `bitcoincash:qr7fzmep8g7h7ymfxy74lgc0v950j3r2959lhtxxsl?m=abc&message=abc`
    },
    {
        error: "Token request is missing a fungible amount and/or NFT commitment.",
        uri: `bitcoincash:zr7fzmep8g7h7ymfxy74lgc0v950j3r295z4y4gq0v?c=0afd5f9ad130d043f627fad3b422ab17cfb5ff0fc69e4782eea7bd0853948428`
    },
    {
        error: "Token request pays to an address without token support.",
        uri: `bitcoincash:qr7fzmep8g7h7ymfxy74lgc0v950j3r2959lhtxxsl?c=0afd5f9ad130d043f627fad3b422ab17cfb5ff0fc69e4782eea7bd0853948428&f=10`
    },
    {
        error: "Token request pays to an address without token support.",
        uri: `bitcoincash:qr7fzmep8g7h7ymfxy74lgc0v950j3r2959lhtxxsl?t&c=0afd5f9ad130d043f627fad3b422ab17cfb5ff0fc69e4782eea7bd0853948428&f=10`
    },
    {
        error: "Token request uses the ambiguous `amount` parameter.",
        uri: `bitcoincash:zr7fzmep8g7h7ymfxy74lgc0v950j3r295z4y4gq0v?c=0afd5f9ad130d043f627fad3b422ab17cfb5ff0fc69e4782eea7bd0853948428&f=10&amount=.0001`
    },
    {
        error: "Token request is missing a token category.",
        uri: `bitcoincash:zr7fzmep8g7h7ymfxy74lgc0v950j3r295z4y4gq0v?f=10`
    },
    {
        error: "Token request is missing a token category.",
        uri: `bitcoincash:zr7fzmep8g7h7ymfxy74lgc0v950j3r295z4y4gq0v?n`
    },
    {
        error: "Token request is missing a token category.",
        uri: `bitcoincash:zr7fzmep8g7h7ymfxy74lgc0v950j3r295z4y4gq0v?n=00`
    }
]