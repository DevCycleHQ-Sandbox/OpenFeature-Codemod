# DevCycle to OpenFeature NodeJS - User Context Transform CodeMod

 * Create a codemod that updates the `DevCycleUser` object to an OpenFeature `EvaluationContext` object.
 * - Replace the `DevCycleUser` object with an `EvaluationContext` object.
 * - Rename the `user_id` field to `targetingKey` in the `EvaluationContext`.
 * - If the code is using Typescript types where its typed as `DevCycleUser`, update it to use `EvaluationContext` from `@openfeature/server-sdk` instead.
 * 
 * `DevCycleUser` objects are generally used as the first parameter to a `variable()` or `variableValue()` call.

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
