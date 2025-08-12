<script>
    import { BPT as bptCat } from '@unspent/blockpoint';
    import { binToHex } from "@bitauth/libauth";
</script>

### About Block Points

Block Points (BPT) are a reward token distributed based on the value and age of coins users have already hold. 


The CashToken category id for Block Points is:

   [{ binToHex(bptCat) }](https://explorer.salemkode.com/token/7fe0cd5197494e47ade81eb164dcdbd51859ffbe581fe4a818085d56b2f3062c)

All 9.2 quintillion Block Points were [minted in this transaction](https://explorer.salemkode.com/tx/2420c5803f7318160bd4ed6729eecb8385688b79fa5653b8c64a1a8167b5e79f). The entire circulating supply was then sent to the Block Point vault contract in [this transaction](https://explorer.salemkode.com/address/bitcoincash:r0ak899wsk9mr9wz78tw2pnppumzry6ypejfvsad6u4vrj4kdewpwsmza35av).

The Block Point vault can only release tokens based on the age of the vault thread or coin being used (whichever utxo is younger). The vault can release tokens at a rate of one Block Point (1 BPT) per coin per block. Users with that don't have a whole coin can claim rewards at the same rate as user with many blocks.

Anytime coins are moved, the age of the coin resets. So don't move coins to claim Block Points, wait until you can sign with the wallet you have. 