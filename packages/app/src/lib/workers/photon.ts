const STATUS_FINISHED = 'STATUS_FINISHED';
const STATUS_PROCESSING = 'STATUS_PROCESSING';
const STATUS_IDLE = 'STATUS_IDLE';
const STATUS_ERROR = 'STATUS_ERROR';
const MESSAGE_START = 'START';

import { mine } from '@unspent/photon';

self.onmessage = (e) => {
  // Check possible messages coming from the website
  switch (e.data.task) {
    case MESSAGE_START:
      // Return a message that the task is about to start.
      postMessage({ status: STATUS_PROCESSING, message: `Task mining ${Date.now()}` });
      // Start the long running function.
      mineJob(e.data.key, e.data.template);
      break;
    default:
      postMessage({ status: STATUS_ERROR, message: 'Unknown task name.' });
  }
};

async function mineJob(key:any, template:any) {
  let result = await mine(key, template);
  console.log("mine job finished: ", result)
  postMessage({ status: STATUS_FINISHED, result: result, message: `Task finished` });
}

