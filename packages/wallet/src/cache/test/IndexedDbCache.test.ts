import test from 'ava';
import { IndexedDbCache } from "../IndexedDbCache.js";

test("IndexedDbCache Tests", async t => {
  
    const cache = new IndexedDbCache();
    await cache.init();
    await cache.setItem("key", "value");
    const value = await cache.getItem("key");
    t.assert(value == "value");

    await cache.removeItem("key");
    const value2 = await cache.getItem("key");
    t.assert(!value2);
    
});
