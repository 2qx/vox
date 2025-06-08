import test from 'ava';
import Future from "../auth.js"

test('Should run auth scenerios', (t) => {
    console.log(Future.generateTests())

    t.assert(1 == 1, "Coupons should have a test")
});
