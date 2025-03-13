let openFeatureClient: Client;

async function initializeDevCycleClient() {
  const devcycleProvider = new DevCycleProvider(DEVCYCLE_SERVER_SDK_KEY, {
    logLevel: "info",
    eventFlushIntervalMS: 1000,
  });

  await OpenFeature.setProviderAndWait(devcycleProvider);
  const openFeatureClient = OpenFeature.getClient();
  return openFeatureClient;
}

function getDevCycleClient() {
  return openFeatureClient;
}

export { initializeDevCycleClient, getDevCycleClient };
