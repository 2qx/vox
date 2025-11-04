import packageInfo from '../package.json' with { type: "json" };


export * from './channel.js'
export * from './constant.js';
export * from './coupon.js'
export * from './vault.js'
export const USER_AGENT = packageInfo.name;

