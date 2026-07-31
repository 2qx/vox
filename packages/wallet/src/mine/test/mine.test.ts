import { mine } from "../mine.js";
import { RegTestWallet } from "../../wallet/Wif.js";

describe(`Test Mining on Regtest`, () => {
  test("Should mine two blocks", async () => {
    const minerWallet = await RegTestWallet.newRandom();
    const response = await mine({ cashaddr: minerWallet.cashaddr!, blocks: 2 });
    expect(response.length).toBe(2);
  });
});
