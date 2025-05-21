import {
    Transaction,
	Output
} from '@bitauth/libauth';

/* Named aliases for basic types */
export type BlockHeight = number;
export type Satoshis = number;

/** Number of tokens. */
export type TokenAmount = string;

/** Category that identifies the token type. */
export type TokenCategory = string;

/** Current commitment data for the specific NFT. */
export type TokenCommitment = string;

/** Capability information on the specific NFT. */
export type TokenCapabilities = 'none' | 'mutable' | 'minting';


export type TransactionHash = string;

export type TransactionMerklePosition = number;

export enum SignatureAlgorithm {
	ECDSA = 0x00,
	SCHNORR = 0x01,
}

export enum HashType {
	SIGHASH_ALL = 0x01,
	SIGHASH_NONE = 0x02,
	SIGHASH_SINGLE = 0x03,
	SIGHASH_UTXOS = 0x20,
	SIGHASH_ANYONECANPAY = 0x80,
}


/**
 * Structured token data used in various electrum cash methods.
 */
export interface TokenData {
	token_data?:
	{
		amount: TokenAmount;
		category: TokenCategory;
		nft?:
		{
			capability: TokenCapabilities;
			commitment: TokenCommitment;
		};
	};
}


/**
 * A list of unspent outputs in blockchain order. This function takes the mempool into account. Mempool transactions paying to the address are included at the end of the list in an undefined order. Any output that is spent in the mempool does not appear.
 * @property tx_pos {TransactionMerklePosition} - TODO: Document me.
 * @property tx_hash {TransactionHash}          - TODO: Document me.
 * @property height {BlockHeight}               - TODO: Document me.
 * @property value {Satoshis}                   - TODO: Document me.
 * @property token_data {TokenData}             - TODO: Document me.
 */
export interface AddressListUnspentEntry extends TokenData {
	tx_pos: TransactionMerklePosition;
	tx_hash: TransactionHash;
	height: BlockHeight;
	value: Satoshis;
}


export interface GenerateUnlockingBytecodeOptions {
	transaction: Transaction;
	sourceOutputs: Output[];
	inputIndex: number;
  }

export interface Unlocker {
	generateLockingBytecode: () => Uint8Array;
	generateUnlockingBytecode: (options: GenerateUnlockingBytecodeOptions) => Uint8Array;
}