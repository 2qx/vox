import { NFTCapability, UtxoI } from "./types.js"
import { SendRequestType, TokenSendRequest } from "./requests.js";


/**
 * getSuitableUtxos - Filter a list of unspent transaction outputs to the minimum needed to complete a transaction
 *
 * a intermediate function
 *
 * @param unspentOutputs  An unfiltered list of available unspent transaction outputs
 *
 * @returns A promise to a list of unspent outputs
 */
export async function getSuitableUtxos(
    inputs: UtxoI[],
    amountRequired: bigint | undefined,
    requests: SendRequestType[],
    ensureUtxos: UtxoI[] = [],
    tokenOperation: "send" | "genesis" | "mint" | "burn" = "send"
): Promise<UtxoI[]> {
    const suitableUtxos: UtxoI[] = [...ensureUtxos];
    let amountAvailable = BigInt(0);
    const tokenRequests = requests.filter(
        (val) => val instanceof TokenSendRequest
    ) as TokenSendRequest[];

    const availableInputs = inputs.slice();
    const selectedInputs: UtxoI[] = [];

    // find matching utxos for token transfers
    if (tokenOperation === "send") {
        for (const request of tokenRequests) {
            const tokenInputs = availableInputs.filter(
                (val) => val.token_data?.category === request.tokenId
            );
            const sameCommitmentTokens = [...suitableUtxos, ...tokenInputs]
                .filter(
                    (val) =>
                        val.token_data?.nft?.commitment === request.capability &&
                        val.token_data?.nft?.commitment === request.commitment
                )
                .filter(
                    (val) =>
                        selectedInputs.find(
                            (selected) =>
                                val.tx_hash === selected.tx_hash && val.tx_pos === selected.tx_pos
                        ) === undefined
                );
            if (sameCommitmentTokens.length) {
                const input = sameCommitmentTokens[0];
                const index = availableInputs.indexOf(input!);
                if (index !== -1) {
                    suitableUtxos.push(input!);
                    selectedInputs.push(input!);
                    availableInputs.splice(index, 1);
                    amountAvailable += BigInt(input!.value);
                }

                continue;
            }

            if (
                request.capability === NFTCapability.minting ||
                request.capability === NFTCapability.mutable
            ) {
                const changeCommitmentTokens = [
                    ...suitableUtxos,
                    ...tokenInputs,
                ].filter((val) => val.token_data?.nft?.capability === request.capability);
                if (changeCommitmentTokens.length) {
                    const input = changeCommitmentTokens[0];
                    const index = availableInputs.indexOf(input!);
                    if (index !== -1) {
                        suitableUtxos.push(input!);
                        availableInputs.splice(index, 1);
                        amountAvailable += BigInt(input!.value);
                    }
                    continue;
                }
            }

            // handle splitting the hybrid (FT+NFT) token into its parts
            if (
                request.capability === undefined &&
                request.commitment === undefined &&
                [...suitableUtxos, ...tokenInputs]
                    .map((val) => val.token_data?.category)
                    .includes(request.tokenId)
            ) {
                continue;
            }

            throw Error(
                `No suitable token utxos available to send token with id "${request.tokenId}", capability "${request.capability}", commitment "${request.commitment}"`
            );
        }
    }

    // find plain bch outputs
    for (const u of availableInputs) {
        if (u.token_data) {
            continue;
        }

        suitableUtxos.push(u);
        amountAvailable += BigInt(u.value);
        // if amountRequired is not given, assume it is a max spend request, skip this condition
        if (amountRequired && amountAvailable > amountRequired) {
            break;
        }
    }

    const addEnsured = (suitableUtxos:UtxoI[]) => {
        return [...ensureUtxos, ...suitableUtxos].filter(
            (val, index, array) =>
                array.findIndex(
                    (other) => other.tx_hash === val.tx_hash && other.tx_pos === val.tx_pos
                ) === index
        );
    };



    // If the amount needed is met, or no amount is given, return
    if (typeof amountRequired === "undefined") {
        return addEnsured(suitableUtxos);
    } else if (amountAvailable < amountRequired) {
        const e: any = Error(
            `Amount required was not met, ${amountRequired} satoshis needed, ${amountAvailable} satoshis available`
        );
        e["data"] = {
            required: amountRequired,
            available: amountAvailable,
        };
        throw e;
    } else {
        return addEnsured(suitableUtxos);
    }
}