import type {
	UtxoI
} from '@unspent/tau';

export const COUPON_ADDRESSES = {
    "1000000": {
        "10000000": "bitcoincash:pdhlp3ese7zsmnd3ws52wa79kn86qpvlzgs2cxgs7hae8tkfhk0mvuv03lpal",
        "100000000": "bitcoincash:p0wt8wuxnq2kvwz5mpehxx70gdg5t28ru2729kg20y8j7eujrnjmyq9anudcs",
        "1000000000": "bitcoincash:p0lyzlrg4gawhpk566s3q2t3dnd4ca6mxuwxau47zal5pu5jeeslgukrmgpy3",
        "10000000000": "bitcoincash:pwlrd6kkk8jqfxm88dkc9llamrvkmxka44qq79zy4avmln98zq4fvmzd4dhv5",
    }
}

export const COUPON_1E6_LOCK = "aa206ff0c730cf850dcdb17428a777c5b4cfa0059f1220ac1910f5fb93aec9bd9fb687"

export const COUPON_1E6_UNLOCK = "23aa201080af3a1ecbaba50a6b8a0b20ce3c27381d0e9363ed606f60fa212d868b022187048096980000cc00c694 517aa26900c7517a8769c05193 c39c"
//                                 "23aa201080af3a1ecbaba50a6b8a0b20ce3c27381d0e9363ed606f60fa212d868b022187048096980000cc00c694a16900c788c08bc39c"
export const VAULT_ADDRESSES = {
    "100000": "bitcoincash:rwrkc8ut9pecqdydtncc6sj87anajksxu3eun5uvu5zdxspqkz68ghgf63ahv",
    "900000": "bitcoincash:rw4wzu4rmls78c82twspt7ecuf78pzrmjdgxyuwd4qvz799nat55za7pg6992",
    "1000000": "bitcoincash:rvggpte6rm96hfg2dw9qkgxw8snns8gwjd376cr0vrazztvx3vpzzjvw79djz"
}

export const CHANNEL_ADDRESSES = {
    "": "bitcoincash:r0sp29zr3y4v0hh4va560plajzv4kenqud0pu6nhdymnkqt7qm6ezr3rfkf82",
    "btc": "bitcoincash:r0dyq08hkwdl56wfephr70lf96auy22k8wu8x7u75fvpm7uauw5lcuw378qvf",
    "test": "bitcoincash:r0am63vr5c9qqtwrz5zrdexatfw946dsfdfk5qpe2vnem5h89nkczedyqe9c0"
}


export const WALLET_UTXOS: UtxoI[] = [
    {
        "height": 896376,
        "tx_hash": "04d8e45c9834d106676f08ecc2def7f2cba2098536443c0cb9f23672128236c8",
        "tx_pos": 1,
        "value": 50800
    }
];


export const CONTRACT_UTXOS: UtxoI[] = [{
    "height": 896376,
    "tx_hash": "04d8e45c9834d106676f08ecc2def7f2cba2098536443c0cb9f23672128236c8",
    "tx_pos": 0,
    "value": 800,
    "token_data": {
        "category": "ff4d6e4b90aa8158d39c5dc874fd9411af1ac3b5ed6f354755e8362a0d02c6b3",
        "amount": "1000000"
    }
}];