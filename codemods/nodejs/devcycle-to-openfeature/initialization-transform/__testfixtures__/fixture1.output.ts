let openFeatureClient: Client;

async function initializeDevCycleClient() {
  const Devcycleprovider = new DevCycleProvider(DEVCYCLE_SERVER_SDK_KEY, {
    logLevel: "info",
    eventFlushIntervalMS: 1000,
  });

  await OpenFeature.setProviderAndWait(Devcycleprovider);
  const openFeatureClient = OpenFeature.getClient();
  return openFeatureClient;
}

function getDevCycleClient() {
  return openFeatureClient;
}

export { initializeDevCycleClient, getDevCycleClient };
