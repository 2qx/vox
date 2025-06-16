declare const self: SharedWorker;

console.log("Starting shared worker")

onconnect = (e) => {
  const port = e.ports[0];

  port.addEventListener("message", (e) => {
    console.log("message in worker:", e.data);
    const workerResult = `Result: ${e.data[0] * e.data[1]}`;
    port.postMessage(workerResult);
  });

  port.start(); // Required when using addEventListener. Otherwise called implicitly by onmessage setter.
};


export {};