<script>
    
    import { page } from '$app/state';

    import { BPTS as bptsCat } from '@unspent/blockpoint';
    import { binToHex } from "@bitauth/libauth";

	import { BPTS as bptCat, tBPTS as tbptCat } from '@unspent/blockpoint';

   	const isMainnet = page.url.hostname == 'vox.cash';
    const category = isMainnet ? binToHex(bptCat) : binToHex(tbptCat);
	const ticker = isMainnet ? 'BPTS' : 'tBPTS';

</script>

### About Block Points


Block Points ({ticker}) are a reward token distributed based on the value and age of coins users have already hold. 


The CashToken category id for Block Points is:


[{ category }](https://explorer.salemkode.com/token/{category})

The Block Point vault can only release tokens based on the age of the vault thread or coin being used (whichever utxo is younger). The vault can release tokens at a rate of 1 Block Point per coin per block. Users with that don't have a whole coin can claim rewards at the same rate as user with many coins.

Any time coins are moved, the age of the coin resets. So don't move coins to claim BlockPoints, wait until you can sign with the wallet you have. 


### Funding

The Block Point (BPT1) Vault was funded in this transaction:

    5e9f4a5a95f4e4ef2dd906df30103f71013f15e8e283852cfc5baccb3cf36ae1
 
The vault consists of 337 threads, each with 27369056489183310 BPT1 each. 

The funding transaction left 337 BPT1 change, which were [burned](https://www.tokenburner.cash/burn/1d29e65ab28a575e545848fea056ff39dd4c225b2fd4017d0aaec49aa7ad1a67) using the CashToken burner contract.