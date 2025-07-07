import test from 'ava';

// @ts-ignore
import  getAnAliceWallet  from "../../../../scripts/aliceWallet.js";



// Async arrow function
test('promises the truth', async t => {
	const alice = await getAnAliceWallet(500_000)
    //alice.provider = regTest
    const aliceBalance = await alice.getBalance('sats') as number
    t.is(aliceBalance, 500000);
});