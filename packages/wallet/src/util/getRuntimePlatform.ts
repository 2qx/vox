export enum RuntimePlatform {
  browser = "browser",
  webworker = "webworker",
  other = "other"
}

export function getRuntimePlatform(): RuntimePlatform {
  if (
      //@ts-ignore
      "undefined" !== typeof WorkerGlobalScope &&
      "function" === typeof importScripts &&
      //@ts-ignore
      navigator instanceof WorkerNavigator
    ) {
      return RuntimePlatform.webworker;
    } else if (
      "undefined" !== typeof navigator &&
      "undefined" !== typeof document
    ) {
      return RuntimePlatform.browser;
    } else {
      return RuntimePlatform.other;
    }
}
