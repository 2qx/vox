import type {
	UtxoI
} from '@unspent/tau';

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
        "token_data":{
            "category": "ff4d6e4b90aa8158d39c5dc874fd9411af1ac3b5ed6f354755e8362a0d02c6b3",
            "amount": "1000000"
        }
	}];
