import fs from 'node:fs';



export default {
  require: ['./_force-exit.mjs'],
  "timeout": "10s",
  "environmentVariables": {
    "ALICE_ID": "wif:regtest:cNfsPtqN2bMRS7vH5qd8tR8GMvgXyL5BjnGAKgZ8DYEiCrCCQcP6",
    "ADDRESS": "bchreg:qpttdv3qg2usm4nm7talhxhl05mlhms3ys43u76rn0",
    "PRIVATE_KEY": "xprv9uNAm3q3naGkP6tZR1VxjiAaFp3zhT83CHPc3fUtQzGn8ZPphYbxtuxbdCzGCrjYtcoSdRK2XpXTCbyhhzfb3qhqw2mA3pAaS1PcXY1ivfi",
    "PUBLIC_KEY": "xpub68MXAZMwcwq3bay2X32y6r7JoqtV6uqtZWKCr3tVyKom1MiyF5vDSiH5UUymFQnBfY3YDgrBAWY8zxM64PBczZbrSUdTvTrCdD46Dai2WFq"
  },
  "typescript": {
    "rewritePaths": Object.fromEntries(
      fs.readdirSync('./packages/')
        .map((name) => [`packages/${name}/src/`, `packages/${name}/out/`])
    ),
    "compile": false
  },
  "verbose": true,
  "nodeArguments": [
    "--experimental-json-modules",
    "--disable-warning=ExperimentalWarning"
  ]
};

