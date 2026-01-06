import { vmNumberToBigInt, hexToBin } from "@bitauth/libauth";
import { getFbchIconSvgUri } from "../packages/future/out/icon.js";

let series = [
  {
    category: "1646d61991d7aa8323ad2896118dbed261abee06645932713fc171ca9c61676d", seriesHex: "00093d"
  },
  {
    category: "801e24f43a6948b31b2e96bac332449a7b74683904f3bcf12f3734db3d0e3ecf", seriesHex: "00350c"
  },
  {
    category: "fb49602905b124b32366855217baa398816b23893b0ccb0edcf5e3531397cc39", seriesHex: "005f05"
  },
  {
    category: "b57e6325849d82992003462d92ca8459391d957891f1bd1709571209cbcacc32", seriesHex: "006504"
  },
  {
    category: "9f2025845d70989c94f2cd852d5bf268e5a36cd45ecb5bc8d2da827a52777904", seriesHex: "006a18"
  },
  {
    category: "a7180168a8feab2c4e3c27663f1757319881e6807885d3f615b8a35c3ff6dd21", seriesHex: "006b03"
  },
  {
    category: "0c5eedba9f3be6d005829bd69ecfe145da5ee1432cf21a9dfdedd2209e31637a", seriesHex: "009f24"
  },
  {
    category: "95e5fc274a2f59a1cab887931fc11426a4a75991d6f5c1b0eb6951e3e35322e3", seriesHex: "00d430"
  },
  {
    category: "12d6a8da50b14f0e2bf89d2348da97dc35de46363e433c03b1b78dbf289a91a5", seriesHex: "00e204"
  },
  {
    category: "d4ad498efa5b290ebad6c8aa6eecaba8834f2d34e2ea63c70775bb917d3db4ae", seriesHex: "00e803"
  },
  {
    category: "4d640e6c2fe97e66f1427d56829ed08f20acf3c4098348abdca2b40a99ef08ec", seriesHex: "083405"
  },
  {
    category: "930af7bbc1a228a52487c89bb957caaa477deab1ab839c38e6adf3983b93aa93", seriesHex: "083a04"
  },
  {
    category: "9aa3dae44863adee39b3559cd073e700e93d5053727a343fd53517b027c52e74", seriesHex: "084003"
  },
  {
    category: "edf0b9acac9ecac076207ff2e61865af5af5cb11fffb078e7c40649be95da8a0", seriesHex: "08b704"
  },
  {
    category: "3156882357218159a1b623fdcd2cd14e2b9321ed0cd43e44b17cb4c9fe0ab8d5", seriesHex: "08bd03"
  },
  {
    category: "3850320488d7533b7b338239742b709b4d161f4c75af55f984de24c18027eebb", seriesHex: "100905"
  },
  {
    category: "515d2071c517c2fd9c1c00cd74ca0ecb3476e70b5a97f790ce3ed06fe43b0dc7", seriesHex: "100f04"
  },
  {
    category: "6f1534978a89e1d67d5071e33832b092bba86138a05a36d10bf196bed822b266", seriesHex: "108c04"
  },
  {
    category: "9f00db8599a796e36c05bb5758c4f183d1358e3b6974033e0bd2b998eb8f75f1", seriesHex: "109203"
  },
  {
    category: "f4cf586c05c8d32e778785eee54154e883b9580037a5c3683a9b30220ccd3d46", seriesHex: "185b05"
  },
  {
    category: "722e521de743441abdfb89485dc2b6d0aac87bae1023abae43fb35e86601a08c", seriesHex: "186104"
  },
  {
    category: "07dd958513348d23c35f99f9c2cd373b98d05ad89125631a04be099a5838f957", seriesHex: "186703"
  },
  {
    category: "1947943c9b5ddaac2ee036a185efb5c149ff84f5c3861f49c9342d7a61f75fe2", seriesHex: "18de04"
  },
  {
    category: "da0dba95c7516e7bc1bf50ad0430d4af35b63eaee45d7d4cd9dc7d3ac8bf62f5", seriesHex: "18e403"
  },
  {
    category: "19bb3fb3fa3745dcab71b8a312618c5e03d711b945ceaec87b153c35cde6043f", seriesHex: "200b20"
  },
  {
    category: "3804e3cd3a7786ceb80eea71f294eb5fd802acb9c77f104b63ec2e2fb116fbb8", seriesHex: "203005"
  },
  {
    category: "056125da008572d7d7a5aaa380d52228ecc777273072a38ef8dee68849e4ff48", seriesHex: "203604"
  },
  {
    category: "9eafea8a0d9136eec32a7344d154f2be26fe7e1f82a8d6655dc166bba9de7011", seriesHex: "20402c"
  },
  {
    category: "7096f33f3f7de57890aefb304ba9cf9bd7fca79541dbac9c31ce89fe8fe528b1", seriesHex: "20a107"
  },
  {
    category: "ee40b6c6db52f65beade384cee926d4bed235dad711fd604f782548cb1df62f1", seriesHex: "20b304"
  },
  {
    category: "628c19b66e5ffb86b546fe505bfce4969518451dfaa09558e52dc6ce5edc423e", seriesHex: "20b903"
  },
  {
    category: "40bf630932612471cb3c9c20fc9a192f00b6f2bdc03758d15627667f0dbf4a1d", seriesHex: "20d613"
  },
  {
    category: "b34b03a82f30716831efbc0589e807a548faee3654ac271085c7242582667643", seriesHex: "280505"
  },
  {
    category: "898f3bc575edfb9852a726c83b1a0275735bee067f4dfb4e57d65b10794ea1fa", seriesHex: "280b04"
  },
  {
    category: "64471aacc2403e614d01e41f41de11fe350505ea7677c55b780479c331e3e9c6", seriesHex: "288804"
  },
  {
    category: "f8d7fbf198b720cf6e7752dfa0dbe0e99b5ea3f2dd372e4786481ec6a4995b70", seriesHex: "288e03"
  },
  {
    category: "0bbbdf6624a3497868862d88200f042689da773a811cd9a21e03a431e4ecdd7c", seriesHex: "305705"
  },
  {
    category: "702267815812e715202247fbeb3277da30f5734b7de96665f9a2bfe1e3189364", seriesHex: "305d04"
  },
  {
    category: "642ffb323cdd9a6fb6be5a0e49f210550b1736dda13fcc71bf57d0f196573096", seriesHex: "306303"
  },
  {
    category: "79a5f5b0ddbe4809c9c8c2d11d26dfcd00b68f8c48e5ba5bee6a0023156e2ad2", seriesHex: "30da04"
  },
  {
    category: "3c248394bde01ebc3df3ab72f3d0ff90b547ea7daa64658fa6ee26a22ac72b52", seriesHex: "30e003"
  },
  {
    category: "0ca871186c71d8771435dff9391172f6106bca1b8a996b92c15cde1deb1b6c19", seriesHex: "382c05"
  },
  {
    category: "7d1d308588701d5f4e552a0aca42d4173b2591799038b37b908cf8aaa3769c55", seriesHex: "383204"
  },
  {
    category: "6a5b18ccdc9336339744f022f78df766059f0fa2eac0d7c2f2b51ecf5555e7bd", seriesHex: "38af04"
  },
  {
    category: "d4fa81c24e9bfe0c923a1a65d66de009e6cbf98b742f260cc58cbd489d54e7e7", seriesHex: "38b503"
  },
  {
    category: "50becc477571784a55376b016bdaa87a8f1bbf908f973ebfd976f945b15ec597", seriesHex: "400105"
  },
  {
    category: "5c4e015e1a23437520b016d80a6a71eb32c81614b7a9453cbb04f431521e8000", seriesHex: "400704"
  },
  {
    category: "152e83d9c3226c042902bb958c1e6dc111a02b0c601d131ca0ab0282db617f12", seriesHex: "40420f"
  },
  {
    category: "b4e7bdc352fc8414357228badce4d2d442351353e8412ec2a8314586f3aa90dc", seriesHex: "40771b"
  },
  {
    category: "5e1f1b710872b180a3709f8f2d3429dd4a81a6312f6fc63dafa8cc6e597fc570", seriesHex: "407e05"
  },
  {
    category: "7a61a0e17701c06f2dfbdb91369221e44e2831a473c71d6222aed539d6a07e2a", seriesHex: "408404"
  },
  {
    category: "a713740c2983bf89ff139a23d2d563d73c8c49c4e1be949298d9d74b3e373d6e", seriesHex: "408a03"
  },
  {
    category: "d6ce9a648837163983b165aa3b7dd37006276ea2cce3ebef0df37cce2a5668be", seriesHex: "40ac27"
  },
  {
    category: "886229a479aa898f88b349ef3ece49c356338ffa27b8d0049ddb924b84baefd0", seriesHex: "40e133"
  },
  {
    category: "38145433cb69f53f7987eb29bf82f51ab7fac328c1f99902dc18d4f88f173ea4", seriesHex: "485305"
  },
  {
    category: "0adc20a315c11cd0ef91a9984026ad4e7f298abfa419439cc24f0144fae57cc7", seriesHex: "485904"
  },
  {
    category: "711e21fd12f46a8bcc705d945c76fc6d19d99aefb7e37516f09b4525f4b0f68d", seriesHex: "485f03"
  },
  {
    category: "0f00a72de4a8a5947a494ffe3117533a78446353826e1159531e07142936296b", seriesHex: "48d604"
  },
  {
    category: "86fa1ec8c994b6dc95d290c352e34f1fb2ad52ab3eb3de1e4daebf8d64bfb7b1", seriesHex: "48dc03"
  },
  {
    category: "8c35fb133163f8eca4b1f118ad3a0ff9f72c3fcfdc06be856d997ed96aa624e5", seriesHex: "502805"
  },
  {
    category: "f7909bafd8c2b5c78a64308974c6165ba575b75ed42c015f17ce44ed78184315", seriesHex: "502e04"
  },
  {
    category: "f76537b5425d00725e0546b974c8f948752f396d843f6717397e719279f847e4", seriesHex: "50a505"
  },
  {
    category: "05492e3d18b1a7c5aec22eae3c11af9ea2c28ce324f1e0ec8fc61c6da97d6f1a", seriesHex: "50ab04"
  },
  {
    category: "acec42955e2f4c836a0c84bfb282a537b3fb9cbf87629350f0a7757565ec7e9b", seriesHex: "50b103"
  },
  {
    category: "9dccb323e48d802a8f6fd02717e749229da7fb72a11e427d89f5f7689a76beb5", seriesHex: "580304"
  },
  {
    category: "5f72db93249a71d4a4ed39230b40b5826a285ca994f3ddb902260162327dcf61", seriesHex: "588004"
  },
  {
    category: "710cf00d3c2d1774eac55ecd0b5a92dcd55e0ed1857cc5e65d8ce000be86b7d8", seriesHex: "588603"
  },
  {
    category: "da404e911120c5de1c2c9a54ec7f7aba64848a87b7a7fd7c07d7cedb21293aa9", seriesHex: "58fd04"
  },
  {
    category: "ff274e177488406754e357e8c08cc9b5d813de7093c4c186dd9480b611c8321b", seriesHex: "601823"
  },
  {
    category: "2a0a47d12cdb66465b7199b19dfbe871ca3303dda256409d87523e22eeb5d241", seriesHex: "604d2f"
  },
  {
    category: "2d3c4c23c90b4b165842801ed10145f0c72ac96898a98663565e2e847cd23c1a", seriesHex: "604f05"
  },
  {
    category: "0e86dae5631bbd9597866165e03defd3f73286dbb01e2b6d2d28b44317c02d55", seriesHex: "605504"
  },
  {
    category: "4e9fd70d45c87f61dc9f438a4c2559b58ba4a64c23ac34ceb3998954232d96d6", seriesHex: "605b03"
  },
  {
    category: "541c2981b75eafea325a3038b03c6a1c03f07a5574ea24ffb820970ebbcb7d57", seriesHex: "60ae0a"
  },
  {
    category: "738a840f82d6f4509ddd1bfefe2a26bed68eef3e5b5c4f738f4c562d2dafc01e", seriesHex: "60cc05"
  },
  {
    category: "bfa4ee0525e4d281f6b7b743250df7562af1035eeefc68e73c29a4d4650f7e97", seriesHex: "60d204"
  },
  {
    category: "94256faf1a1c4aaf410e84cc9c167604bc61472ea645a511d320b9db47fd74b1", seriesHex: "60d803"
  },
  {
    category: "aedb99db97d4516025d14919555d9c881738314bcd39da49f6e3232040d8ced9", seriesHex: "60e316"
  },
  {
    category: "934ac402ff19f493ffc7ec64de085381b3d06bb6a6af205dff1ef0373586d2cf", seriesHex: "682405"
  },
  {
    category: "76d52237f5e22218ab562cd8485cdae0cfdb3c557bb2f03b00f3e3d379bd29cc", seriesHex: "682a04"
  },
  {
    category: "561ec7e1e97335365df2ec3ac5bc2f9c80f3742c415bd6806b186dc6ccd09cfb", seriesHex: "68a704"
  },
  {
    category: "a26e56b68538814d3ddb15444071fa21f5555524a5dd470e8f4913c2183d28b8", seriesHex: "68ad03"
  },
  {
    category: "834dd171180423c0bbd012320fd12cb1e22925d252e3a3ca45351b6579cad8f5", seriesHex: "707c04"
  },
  {
    category: "8df676096fa0959cf2ff48d81f93c637303d0584bafa7d756811e14ae5371c11", seriesHex: "708203"
  },
  {
    category: "451240e0580089b42a3151b06589681c159e46c1431b527c7516fdb01f713f0d", seriesHex: "70f305"
  },
  {
    category: "3ff586beaaf11f551312f67707319ca508ded6a6e6629f100da093ec925b2f64", seriesHex: "70f904"
  },
  {
    category: "89da2fbd441dc85c12b8ce9cfe4fd3a6d04a487f7806d3a04a7be585da542631", seriesHex: "70ff03"
  },
  {
    category: "6deb2ca40f9fe4dbedb9116a81e69c42f7c2012f782b251e461bab8ce8e9b1d5", seriesHex: "784b05"
  },
  {
    category: "0439adc6a534c6288d4cd971b5b04738c9a40ab5fd0107e0e5f7c5f2ed3ac2c1", seriesHex: "785104"
  },
  {
    category: "412dea0c5decb6516fa41b031ce9253358b0eb93bc914949a299ed6371c5dfa2", seriesHex: "785703"
  },
  {
    category: "29aa393e7f38b336222df9c83decaf6fbc2d926f254a1d5ad203cb863a923f13", seriesHex: "78ce04"
  },
  {
    category: "0a07e013dad5931aa8c2fa2f4840d12edc50b7b81ec7ab66a4ce4dcda939c388", seriesHex: "78d403"
  },
  {
    category: "f4851b4662f9273a42a21cfd68e7647cda5482b8e18503f7392d6dcd7178a936", seriesHex: "801a06"
  },
  {
    category: "7905a664369f66fbc697d52803ccb0303ccfc20d8b1380ec8bd7cb1d03ae0163", seriesHex: "802005"
  },
  {
    category: "75e3b2f9c5663c35d11a363ec3d94524c8dcb70c793adb906d7b0e56f26a460d", seriesHex: "802604"
  },
  {
    category: "48260af8e61d831cd9271f04f1d393ddb8c9e332b089840d07ffffea855e4d52", seriesHex: "804f12"
  },
  {
    category: "cee3aa93c8ad2ef3cac9cb8ab93a972896f274d0c1d52939da684f6ba7c2ee3d", seriesHex: "80841e"
  },
  {
    category: "3aa0cb61a8e44c8e1865f21d70e793de4d9ef9a312560ff316128d41fdc45a98", seriesHex: "80a304"
  },
  {
    category: "f3be80c7db9269341b3072c9ba0d1039005247490a0299f39acef22d9e4aa461", seriesHex: "80a903"
  },
  {
    category: "b7b56fbfd599d92f818ef29d62d9e26782b839772fe492cc883697a45cd6d859", seriesHex: "80b92a"
  },
  {
    category: "7ae97ce67e834c296acfb0258259cd983eb2ba5b0ed9476c56c7d40496bf239b", seriesHex: "887804"
  },
  {
    category: "dcbc70dd0a88760833fc53cff47eb7079ec844b3b66dbba41a8a2a87c927228a", seriesHex: "887e03"
  },
  {
    category: "60be9a627ae6174686c850c344ef8d59bae4f158e063b3ce40dce17033a426af", seriesHex: "88f504"
  },
  {
    category: "fd08ae8989addd46bd90bb0e65fc3fbac8496392cd0da3fbd090601c5765c72c", seriesHex: "88fb03"
  },
  {
    category: "b1e5a151aa3567fa1a4b51f7286a0d87b576d5ac12f5cc2a6c466f5e4a00981a", seriesHex: "904106"
  },
  {
    category: "71752ad00debb6a60e5961ee3adbcba4f11df684998fb1756440842e2ef2308c", seriesHex: "904705"
  },
  {
    category: "3f38ca4cf8f9be1d5ce1629182beaaacd760e7b61da5d5ba48caec1ac65fc3f5", seriesHex: "904d04"
  },
  {
    category: "44953ba596d2db0261c22a6a2ad8a513a3eb60a6ed77b7389663e816cf653bf5", seriesHex: "905303"
  },
  {
    category: "63c134e201968fe8a88cc76679a9230cbbad831854ba864131cb25da8a845767", seriesHex: "90ca04"
  },
  {
    category: "0c7c5021f7570a730177af4737b7d5147bc5529a5e5e066a4e0b453720a8d913", seriesHex: "90d003"
  },
  {
    category: "721e58cf49fe3c4dc0129f202f6c9494951a2fe5c366a16fb72617d382d8cf7a", seriesHex: "981c05"
  },
  {
    category: "926fc0ddaf48bf6a24bc33cb488de1c05b0a703901043443898b7d950d3be83a", seriesHex: "982204"
  },
  {
    category: "586e70f3e2409ea57c1a0019587bf1ec43c00e2fe47e1ae027f3797597133afe", seriesHex: "989f04"
  },
  {
    category: "3d681cfd4bde30d25e2687fd01d13b3ffd0c3317e78654fbb12a80464cc60a2f", seriesHex: "98a503"
  },
  {
    category: "cd897b9add86e01c72da4e277f5ff3b863017da9264fea5e87d35dabe6986775", seriesHex: "a02526"
  },
  {
    category: "eeefab145509b8c69cdb9a85e38c3b7dd51f82f5bb22768addc4b96b60f9ba17", seriesHex: "a05a32"
  },
  {
    category: "49880898e90075bf752aa48f48d528344f47bf39405c1d637992e13d7605b144", seriesHex: "a06806"
  },
  {
    category: "afe4f069aacdba59e9f3ceaa3c5cc2eeace085382a87a33b96e15036296239fe", seriesHex: "a07404"
  },
  {
    category: "7974de17e3a5e8bfcc85aa5f746fcd7c1c0416d3968adba52b9d39356377599b", seriesHex: "a07a03"
  },
  {
    category: "bae6359de7dba59562530f4ea84b0263cf44757fccc96765663cd3dc4c46b535", seriesHex: "a0bb0d"
  },
  {
    category: "bf34d6ae5753b0de053a374fc45353016dfd46cee66566741ed2b71d6a401a47", seriesHex: "a0f019"
  },
  {
    category: "1bd994dad1a6f765e6ea934484d4c1ca80ee1276ebc51e80bed8e1efeae4aea7", seriesHex: "a0f104"
  },
  {
    category: "20ce8ef849cb939c679a6cd32e96d15b4f161343596cca8e8c16f940a3275005", seriesHex: "a0f703"
  },
  {
    category: "a73c56da819b7b2375133a736b14195e0a9bc56da52cea4e0d714c8751e8525f", seriesHex: "a84305"
  },
  {
    category: "b004dd92643c3bbbe2ca290b9043c421dbd8e7adc55fe55bbcf45c94066805a4", seriesHex: "a84904"
  },
  {
    category: "326c9795962428311dea5c741299d12c7eeff20988751d3f34f42504530dc7d0", seriesHex: "a84f03"
  },
  {
    category: "b68405b9cb04022d23f241a0cce2693ce5ae04431185ba8b808267781d409162", seriesHex: "a8c604"
  },
  {
    category: "e34a8283513723b7f3ec8a85e781d0c980da2732862a708fa67a59941388fe05", seriesHex: "a8cc03"
  },
  {
    category: "9ca8fede0853ee9380531ca0fc57193c06609c2d4fe6a4c5bce0b65ca9f65a13", seriesHex: "b01805"
  },
  {
    category: "b3f0c549f2cd0eb484de736d5ea1b83c1dfec0494a12c94803cd66226d0dfab5", seriesHex: "b01e04"
  },
  {
    category: "584285701afc26448c463a3b490d0a88f95958226f082e489eed2fdd1c0c1a67", seriesHex: "b08f06"
  },
  {
    category: "9d62c9dfc542d14d959632fa4f354bf03dab026a5d69569b1a25f810d8268045", seriesHex: "b09b04"
  },
  {
    category: "f186a9708569f6b8ad8d47964a0371d5d6e070bb14f8a129076922cece4b8971", seriesHex: "b0a103"
  },
  {
    category: "05d8ff74180b776136410584abcf78e9f0374b1f2247dea9cb199aae22a18f6e", seriesHex: "b87004"
  },
  {
    category: "30aad260a9b83f240b65304b64e69582d5f68363ac8b09f1e387fd12a36bcbe8", seriesHex: "b87603"
  },
  {
    category: "63e458541941eecb20510a82dbfe0cfa92d7ee92cfe78f714c2b154d9ac1578f", seriesHex: "b8ed04"
  },
  {
    category: "4ab008594d9cbede88e47d464d8e0e9472cccb7ecb4ed7dfe0672682f19e6956", seriesHex: "b8f303"
  },
  {
    category: "be11d72dc9490fa97285a7d3a4d6fb6cbd94807c1f03d1362497b8820dc5e1ac", seriesHex: "c02709"
  },
  {
    category: "0c88b884e48c6363006dd4bc3beaf35423822b038c3c87035e60e9dd0d7a7ac9", seriesHex: "c03f05"
  },
  {
    category: "29d264a7f4c2c4d7696d4a922976a74f43f45ad5c75e929ce85cdf70ac679565", seriesHex: "c04504"
  },
  {
    category: "dde1a4429864272f8352a763eb8ac09ecc86ff0a6c6d3ce89ea37163b0432013", seriesHex: "c04b03"
  },
  {
    category: "4dcf337ca473f0ca58a5e97a9274f8e49152a4ef8e7e6ac44b3f743185745918", seriesHex: "c05c15"
  },
  {
    category: "dbacad488a33fc7088318b8ccf5f7f128c1095c54ccaa48bfda6cede0e80b356", seriesHex: "c09121"
  },
  {
    category: "225b87223357193cd89f3b9fd8b24b52aa3cadfbafce711d91a612916e7edd97", seriesHex: "c0b606"
  },
  {
    category: "191d22bfe090b99b4cbd098c078861a7a881b4ea5098567095fcee4d16b7a88e", seriesHex: "c0c204"
  },
  {
    category: "1cd36b2c26d6a6a9e282ed8291fc14005b6ada803352ae20e395f537750a2730", seriesHex: "c0c62d"
  },
  {
    category: "000d5e7908d5835cfd046b93a9d90a239a3574f49b2049f196163bfc994948ae", seriesHex: "c0c803"
  },
  {
    category: "0fc17a1854111f92b3c50492a249c6404dc28d907b2e079f3ca8319426ee0073", seriesHex: "c81405"
  },
  {
    category: "4675199ee443595e43f69620a2a550e1f5643f52d188cc4fe27f07fec40bb65e", seriesHex: "c81a04"
  },
  {
    category: "06ea876eb8b0864f33034cb034768a01a2eaea56fa2721a9292275f06132b2a2", seriesHex: "c89704"
  },
  {
    category: "bee5c86c68f4be082a28a970139eca6bfd96b161b6cdcbbfbc1cd2e71cabe44d", seriesHex: "c89d03"
  },
  {
    category: "c3c44eec58d718fdbc8ec05b48b3586993ed7c4e397cfba522438a042aa4414f", seriesHex: "d06c04"
  },
  {
    category: "887368c27eb66557357637a579584ef5f499886dc66e0ac303cbd66cb9d8e021", seriesHex: "d07203"
  },
  {
    category: "5596e6f5b8b41e79baff2bc24726e5cd3b3e0afd2ec87ed9eb2edb814aea0fb0", seriesHex: "d0dd06"
  },
  {
    category: "a0355b2502af9dfabaee772900ef955e88b421bb26792a14943653203ff879d7", seriesHex: "d0e904"
  },
  {
    category: "1a639ed49e4f8e168d2abc0472229abc0997e6f2bc2c41f18817116eaa2ae60e", seriesHex: "d0ef03"
  },
  {
    category: "03219509eaa85d691f70b303b87c4db6d3d84e0603b65a0b7f502b56633fc386", seriesHex: "d83b05"
  },
  {
    category: "74cf394633dd9f3dfee945339ba6d7380423bb1682a028458ca4b1a8e5fb183f", seriesHex: "d84104"
  },
  {
    category: "d95063cebc4dab0ec44a248813b276c9053b9d73bb3e7cd2c689931eb63678f5", seriesHex: "d84703"
  },
  {
    category: "55a48f2e312685b26fa4b2ebb5e130df389c7ebd72cb5600b9de5dd14bae3231", seriesHex: "d8be04"
  },
  {
    category: "b7c9e3f7308c28ba97070b6e1684a538f83a17cdeec18ac693a8d391daeb6e27", seriesHex: "d8c403"
  },
  {
    category: "e155719b87fa3b1cc0161dd1673a38ae69870b32d1359a1908cff5d57b8c9c15", seriesHex: "e00407"
  },
  {
    category: "181d78875449d15ac163b9e744b9d353878e7923985aab3dab8cfac8164cbab1", seriesHex: "e01005"
  },
  {
    category: "16e73c9507ace5f1b61d878c9d171dce98efe4d4339d3abce1d78d585a8ff5fb", seriesHex: "e01604"
  },
  {
    category: "6a73799963a913c78b9a21410d946acedc834502e945a79f248ce377965c01ff", seriesHex: "e03229"
  },
  {
    category: "91e9772ed15de4d8e489c0b403b2915dcff98ae519c45d02b9a465af0f4f3618", seriesHex: "e06735"
  },
  {
    category: "5307156b269b35f8d870ed7163e9f6d46425b5cb1472ec65b1be9bfd5e2391e6", seriesHex: "e09304"
  },
  {
    category: "2be7e9bd90aec336491ee5ff415a22b8359a23402fbf9fd494b0e6f57f0be670", seriesHex: "e09903"
  },
  {
    category: "3ced6f5cf2d225ef81e3b5792eb51279e92bafd8aa4e96dbc19dcd546421501a", seriesHex: "e0c810"
  },
  {
    category: "9de56154b232213d6382d3a1494d2d6d91a647b561f39c1765922cd73296fe70", seriesHex: "e0fd1c"
  },
  {
    category: "5cba9d55267ab75910aba8a4c88ea2437471ddb2e7e981a6456ef43afa852cd7", seriesHex: "e86205"
  },
  {
    category: "e14975fd26fc24de18d15e715acd81a67dd592934c6e852a445d91d78d61b84f", seriesHex: "e86804"
  },
  {
    category: "a07ec61062ce68f1313066d6ae2862e39dfcd5f34632f2b3dc5dde23c2a7b449", seriesHex: "e86e03"
  },
  {
    category: "62d451e04b293cc5b937e0112f8a7534bcd75ea7b8056b62032eb1eae28cc85a", seriesHex: "e8e504"
  },
  {
    category: "5c2096ca4308b2df0f1ed3895b770094002b7b947f17f268ac12ad200768a474", seriesHex: "e8eb03"
  },
  {
    category: "daa9c324b0499505ed3ffae57d6e500817c7a2e402988ec141c04b4b793ed8b4", seriesHex: "f02b07"
  },
  {
    category: "3f0c2edbf6ccaaeb01dc1342a4f4dd79cbf2c809bd28ef91ef6ceed9bde56a08", seriesHex: "f03705"
  },
  {
    category: "474b942d44057616010b12a6bd47447f03b970e7e2c86e1603fa75a2aab84745", seriesHex: "f03d04"
  },
  {
    category: "351e211eb0ff078b411b66f142ef1cf4ef9c1736e1e3c4d95e74fe5b3ab63bd7", seriesHex: "f04303"
  },
  {
    category: "11e594ab889beb783058191a7dfc0e8c4fd6b7e31b3d8df6d1458460e2afadbe", seriesHex: "f0ba04"
  },
  {
    category: "e749e21b1811fd76e5843f00a6831ac97ee72099230223b48d146cbb5dfafe87", seriesHex: "f0c003"
  },
  {
    category: "ea309eddbecb19d16f2e3cd13696e7eed423728ac8dc79cbcda7b2d61dce5b68", seriesHex: "f80c05"
  },
  {
    category: "d4316395de3ab26b1a2aa29ac1eb2ee4dbd50a9ec613a2b7588a5c269a44360e", seriesHex: "f81204"
  },
  {
    category: "0c36e14714818bb9be508e0ab4bcb7d43c401ebba64a9b0c2f391a183cb044cb", seriesHex: "f88f04"
  },
  {
    category: "2665517759f34c815c3aedc68265098c8dc29c5e3417b193dd58231258515e2b", seriesHex: "f89503"
  }
];

function asBcmrEntry(time, category) {
  return {
    "2024-10-14T00:00:00.000Z": {
      name: "Future BCH " + time.toLocaleString(),
      description:
        "A fungible token redeemable for Bitcoin Cash after block " +
        time.toLocaleString(),
      token: {
        category: category,
        decimals: 8,
        symbol: `tFBCH-${String(time).padStart(7, "0")}`,
      },
      uris: {
        icon: `${getFbchIconSvgUri(time, 400)}`,
        web: `https://futurebitcoin.cash/v?block=${time}`,
      },
    },
  };
}

let bcmr = series
  .map((s) => {
    let time = Number(vmNumberToBigInt(hexToBin(s.seriesHex)));
    return {
      time: time,
      category: s.category,
    };
  })
  .sort((a, b) => a.time - b.time)
  .map((s) => {
    return {
      key: s.category,
      val: asBcmrEntry(s.time, s.category),
    };
  });

bcmr = bcmr.reduce((map, obj) => ((map[obj.key] = obj.val), map), {});

//console.log(JSON.stringify(bcmr, undefined, 2));

let catMap = series
  .map((s) => {
    let time = Number(vmNumberToBigInt(hexToBin(s.seriesHex)));
    return {
      time: time,
      category: s.category,
    };
  })
  .sort((a, b) => a.time - b.time)
  .map((s) => {
    //return [s.time, s.category]
    return [s.category, s.time]
  }
  )//.reduce((map, obj) => ((map[obj.key] = obj.val), map), {});;

console.log(JSON.stringify(catMap, undefined, 2))