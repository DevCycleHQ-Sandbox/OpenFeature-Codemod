const client = initializeDevCycle(DEVCYCLE_SERVER_SDK_KEY, {
  logLevel: "info",
  eventFlushIntervalMS: 1000,
});

await client.onClientInitialized();
