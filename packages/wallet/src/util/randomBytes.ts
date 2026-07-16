import { getRuntimePlatform } from "./getRuntimePlatform.js";

export function generateRandomBytes(len = 32) {
  // window, webworkers, service workers
  return window.crypto.getRandomValues(new Uint8Array(len));
}
