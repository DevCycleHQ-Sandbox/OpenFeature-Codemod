# DevCycle to OpenFeature NodeJS - Initialization Transform CodeMod

This codemod will transform the initialization of DevCycleClient to use OpenFeature NodeJS SDK.

- Calls to `initializeDevCycle()` should be replaced with `new DevCycleProvider()` where the same parameters used.
- The variable named from the `initializeDevCycle()` call should be renamed to replace `client` with `provider`. For example: `devcycleClient` renamed to `devcycleProvider`.
- The new provider should be passed into `await OpenFeature.setProviderAndWait(devcycleProvider);`
- C new `openFeatureClient` should be created from `OpenFeature.getClient()`
- Usages of the variabled named from the `initializeDevCycle()` call should be updated to use the `openFeatureClient` instead.

### Before

```ts
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
```

### After

```ts
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
```
