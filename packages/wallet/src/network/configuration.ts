import { Network } from "../interface.js";
import { getRuntimePlatform } from "../util/index.js";
import * as primary from "./constant.js";

let mainnetServers: string[],
  testnetServers: string[],
  regtestServers: string[];

export class DefaultProvider {
  static servers: { [name: string]: string[] } = {
    mainnet: [] as string[],
    testnet: [] as string[],
    regtest: [] as string[],
  };
}

export function getDefaultServers(network: Network) {
  let env: any;
  env = {};

  mainnetServers = DefaultProvider.servers!['mainnet']!.length
    ? DefaultProvider.servers!['mainnet']!
    : env.ELECTRUM
    ? env.ELECTRUM.split(",")
    : primary.mainnetServers;
  testnetServers = DefaultProvider.servers!['testnet']!.length
    ? DefaultProvider.servers['testnet']
    : env.ELECTRUM_TESTNET
    ? env.ELECTRUM_TESTNET.split(",")
    : primary.testnetServers;
  regtestServers = DefaultProvider.servers!['regtest']!.length
    ? DefaultProvider.servers!['regtest']
    : env.ELECTRUM_REGTEST
    ? env.ELECTRUM_REGTEST.split(",")
    : primary.regtestServers;

  return {
    mainnet: mainnetServers,
    testnet: testnetServers,
    regtest: regtestServers,
  }[network];
}

export function getUserAgent() {
  // Allow users to configure the cluster confidence
  let ua;
  ua = "mainnet-js-" + getRuntimePlatform();
  return ua;
}

export function getConfidence() {
  // Allow users to configure the cluster confidence
  let confidence;
  confidence = 1;
  return confidence;
}
