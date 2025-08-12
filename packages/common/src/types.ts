import {
	Transaction,
	Input,
	Output,
	CompilationData
} from '@bitauth/libauth';

/* Named aliases for basic types */
export type BlockHeight = number;
export type Satoshis = number;

export type TransactionHex = string;
export type TransactionHash = string;
export type TransactionMerklePosition = number;

/** Number of tokens. */
export type TokenAmount = string;

/** Category that identifies the token type. */
export type TokenCategory = string;

/** Current commitment data for the specific NFT. */
export type TokenCommitment = string;

/** Capability information on the specific NFT. */
export type TokenCapabilities = 'none' | 'mutable' | 'minting';

// Weird setup to allow both Enum parameters, as well as literal strings
// https://stackoverflow.com/questions/51433319/typescript-constructor-accept-string-for-enum
const literal = <L extends string>(l: L): L => l;

export const NFTCapability = {
	none: literal("none"),
	mutable: literal("mutable"),
	minting: literal("minting"),
};

export type SourceOutput = Input & Output;

export type NFTCapability = typeof NFTCapability[keyof typeof NFTCapability];

export type CashAddressNetworkPrefix = "bitcoincash" | "bchtest" | "bchreg"



/**
 * A list of confirmed transactions in blockchain order, with the output of blockchain.address.get_mempool() appended to the list.
 *
 * @property tx_hash {TransactionHash} - transaction hash used to identify a transaction.
 * @property height {BlockHeight}      - block height for the block that the transaction has been included in, or 0 for unconfirmed, or -1 for unconfirmed if one or more parents are also unconfirmed.
 * @property fee? {Satoshis}           - satoshis paid as fee for the transaction if it is currently in the mempool.
 */
export interface AddressGetHistoryEntry
{
	tx_hash: TransactionHash;
	height: BlockHeight;
	fee?: Satoshis;
}


/**
 * blockchain.transaction.get
 *
 * @memberof Blockchain.Transaction
 */
export type TransactionGetVerboseResponse = any;
export type TransactionGetResponse = TransactionHex | TransactionGetVerboseResponse;


export interface TransactionRequest { transaction: string, sourceOutputs: SourceOutput[] }

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
 * @property tx_pos {TransactionMerklePosition} - 
 * @property tx_hash {TransactionHash}          - 
 * @property height {BlockHeight}               - 
 * @property value {Satoshis}                   - 
 * @property token_data {TokenData}             - 
 */
export interface UtxoI extends TokenData {
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

