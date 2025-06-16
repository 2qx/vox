(function(){"use strict";console.log("Starting shared worker"),onconnect=e=>{const t=e.ports[0];t.addEventListener("message",s=>{console.log("message in worker:",s.data);const o=`Result: ${s.data[0]*s.data[1]}`;t.postMessage(o)}),t.start()}})();
//# sourceMappingURL=worker-jdfel815.js.map
