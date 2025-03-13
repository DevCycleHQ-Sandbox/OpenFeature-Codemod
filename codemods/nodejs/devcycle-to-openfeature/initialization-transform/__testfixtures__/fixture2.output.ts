const provider = new DevCycleProvider(DEVCYCLE_SERVER_SDK_KEY, {
  logLevel: "info",
  eventFlushIntervalMS: 1000,
});

await OpenFeature.setProviderAndWait(provider);
const client = OpenFeature.getClient();
