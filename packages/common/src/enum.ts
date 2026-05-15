export const enum PushOperationConstants {
  OP_0 = 0,
  /**
   * OP_PUSHBYTES_75
   */
  maximumPushByteOperationSize = 0x4b,
  OP_PUSHDATA_1 = 0x4c,
  OP_PUSHDATA_2 = 0x4d,
  OP_PUSHDATA_4 = 0x4e,
  /**
   * OP_PUSHDATA_4
   */
  // eslint-disable-next-line @typescript-eslint/prefer-literal-enum-member
  highestPushDataOpcode = OP_PUSHDATA_4,
  /**
   * For OP_1 to OP_16, `opcode` is the number offset by `0x50` (80):
   *
   * `OP_N = 0x50 + N`
   *
   * OP_0 is really OP_PUSHBYTES_0 (`0x00`), so it does not follow this pattern.
   */
  pushNumberOpcodesOffset = 0x50,
  /** OP_1 through OP_16 */
  pushNumberOpcodes = 16,
  negativeOne = 0x81,
  OP_1NEGATE = 79,
  /**
   * 256 - 1
   */
  maximumPushData1Size = 255,
  /**
   * 256 ** 2 - 1
   */
  maximumPushData2Size = 65535,
  /**
   * 256 ** 4 - 1
   */
  maximumPushData4Size = 4294967295,
}