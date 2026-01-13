
import test from 'ava';

import { hexToBin } from '@bitauth/libauth';
import Cauldron from "../index.js";


test('test Cauldron covenant address', t => {

    /* cspell:disable-next-line */
    t.is(Cauldron.getAddress(hexToBin("1e90683147cc221749a4525349306aaaf1e87104")), "bitcoincash:rd8fzvey4ptnnxud4yjneq6htxunpdqw3cz8kzlc92mycs2unm7jy3vuquc0m")

});
