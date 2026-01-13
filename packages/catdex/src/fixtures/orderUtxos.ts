import { UtxoI } from "@unspent/tau";

export const AUTH = "beef00000000000000000000000000000000000000000000000000000000beef";
export const ASSET = "7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c";

export const ORDER_UTXOS :UtxoI[] = [
    {
        tx_pos: 0,
        tx_hash: "0000000000000000000000000000000000000000000000000000000000000000",
        height: -1,
        value: 400,
        token_data: {
            amount: "0",
            category: AUTH,
            nft: {
                capability: "mutable",
                commitment: "1400000000000000000000000000008000943577000000000000000000000000"
            }

        }
    },
    {
        tx_pos: 1,
        tx_hash: "0000000000000000000000000000000000000000000000000000000000000000",
        height: -1,
        value: 800,
        token_data: {
            amount: "20",
            category: ASSET
        }
    },
    {
        tx_pos: 0,
        tx_hash: "0000000000000000000000000000000000000000000000000000000000000000",
        height: -1,
        value: 400,
        token_data: {
            amount: "0",
            category: AUTH,
            nft: {
                capability: "mutable",
                commitment: "1400000000000000000000000000000000943577000000000000000000000000"
            }

        }
    },
    {
        tx_pos: 0,
        tx_hash: "0000000000000000000000000000000000000000000000000000000000000000",
        height: -1,
        value: 800,
        token_data: {
            amount: "2000",
            category: ASSET
        }
    },

    {
        tx_pos: 0,
        tx_hash: "0000000000000000000000000000000000000000000000000000000000000000",
        height: -1,
        value: 400,
        token_data: {
            amount: "0",
            category: AUTH,
            nft: {
                capability: "mutable",
                commitment: "8400000000000000000000000000000000943577000000000000000000000000"
            }

        }
    }
];