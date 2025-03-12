let devcycleClient: DevCycleClient;

async function initializeDevCycleClient() {
  devcycleClient = await initializeDevCycle(DEVCYCLE_SERVER_SDK_KEY, {
    logLevel: "info",
    eventFlushIntervalMS: 1000,
  }).onClientInitialized();
  return devcycleClient;
}

function getDevCycleClient() {
  return devcycleClient;
}

export { initializeDevCycleClient, getDevCycleClient };
