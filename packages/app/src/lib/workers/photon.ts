const STATUS_BROADCAST = 'STATUS_BROADCAST';
const STATUS_MINING = 'STATUS_MINING';
const STATUS_ERROR = 'STATUS_ERROR';
const MESSAGE_START = 'START';
const MESSAGE_HALT = 'HALT';

import { hexToBin,  binToNumberUintLE } from '@bitauth/libauth';
import { mine } from '@unspent/photon';

self.onmessage = (e) => {
  // Check possible messages coming from the website
  switch (e.data.task) {
    case MESSAGE_START:
      // Return a message that the task is about to start.
      postMessage({ status: STATUS_MINING, message: `Starting Mining Worker ${e.data.template}` });
      // Start the long running function.
      mineJob(e.data.key, e.data.template);
      break;
    case MESSAGE_HALT:
      console.log("halting")
      close();
    default:
      postMessage({ status: STATUS_ERROR, message: 'Unknown task name.' });
  }
};

async function mineJob(key: any, template: any) {
  const startTime = performance.now()
  let result = await mine(key, template);
  const endTime = performance.now()


  console.log( "mine job finished: ", result)
  
  postMessage({ status: STATUS_BROADCAST, result: result, message: `Task finished` });
}

