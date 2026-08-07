const STATUS_BROADCAST = 'STATUS_BROADCAST';
const STATUS_MINING = 'STATUS_MINING';
const STATUS_ERROR = 'STATUS_ERROR';
const MESSAGE_START = 'START';

import { hexToBin,  binToNumberUintLE } from '@bitauth/libauth';
import { mine } from '@unspent/photon';

self.onmessage = (e) => {
  // Check possible messages coming from the website
  switch (e.data.task) {
    case MESSAGE_START:
      // Return a message that the task is about to start.
      postMessage({ status: STATUS_MINING, message: `Task mining ${Date.now()}` });
      // Start the long running function.
      mineJob(e.data.key, e.data.template);
      break;
    default:
      postMessage({ status: STATUS_ERROR, message: 'Unknown task name.' });
  }
};

async function mineJob(key: any, template: any) {
  const startTime = performance.now()
  let result = await mine(key, template);
  const endTime = performance.now()

  let nonce = binToNumberUintLE(hexToBin(result!).slice(390,393))
  console.log(nonce, "mine job finished: ", result)
  let hashRate = Math.round(nonce * 1000 / (endTime - startTime))
  console.log(hashRate, "h/s")


  postMessage({ status: STATUS_BROADCAST, result: result, hashRate: hashRate, message: `Task finished` });
}

