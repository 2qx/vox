import { 
    UtxoI 
} from "@unspent/tau"

export const STAKE_UTXO = {
    height: 907664,
    tx_hash: "deaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddead",
    tx_pos: 1,
    token_data:{
        category: "deaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddead",
        nft:{
            commitment: "beefbeefbeefbeefbeefbeefbeefbeefbeefbeef000000000000000000000000000000000000ff7f",
            capability: "mutable"
        },
        amount: "12287"
    },
    value: 37500000
} as UtxoI


export const MAIN_BADGER_UTXO = {
    height: 907664,
    tx_hash: "deaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddead",
    tx_pos: 1,
    token_data:{
        category: "deaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddead",
        nft:{
            commitment: "e803000000000000000000000000000000000000beefbeefbeefbeefbeefbeefbeefbeefbeefbeef",
            capability: "minting"
        },
        amount: "9223372036845552464"
    },
    value: 37500000
} as UtxoI