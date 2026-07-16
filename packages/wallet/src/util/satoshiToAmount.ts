import { bchParam } from "../chain.js";
import { UnitEnum } from "../enum.js";
import { sanitizeUnit } from "../util/sanitizeUnit.js";

/**
 * converts given value and unit from satoshi
 *
 * @param {value} number           some value in satoshi
 * @param {rawUnit} any            the target unit
 *
 * @returns a promise to the value in the unit of account given by rawUnit
 */
export async function satoshiToAmount(
  value: bigint,
  rawUnit: any
): Promise<number> {
  const unit = sanitizeUnit(rawUnit);
  switch (unit) {
    case UnitEnum.BCH:
      return Number(value) / Number(bchParam.subUnits);
    case UnitEnum.SAT:
      return Number(value);
    default:
      return Number(value);
  }
}
